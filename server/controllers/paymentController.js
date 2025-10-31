const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Verify Stripe is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not configured in environment variables');
}

// @desc    Create payment intent (Stripe Checkout Session)
// @route   POST /api/payments/create-intent
// @access  Private (Student)
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is published (allow if field doesn't exist for backward compatibility)
    if (course.isPublished === false) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for purchase'
      });
    }

    // Check if already enrolled
    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Calculate amount (use discount price if available)
    const price = course.discountPrice || course.price;
    
    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course price'
      });
    }

    const amount = Math.round(price * 100); // Convert to paise for INR

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: course.title,
              description: course.shortDescription || course.description?.substring(0, 100) || 'Course enrollment',
              images: course.image?.url ? [course.image.url] : [],
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/courses/${courseId}`,
      client_reference_id: req.user._id.toString(),
      metadata: {
        courseId: course._id.toString(),
        userId: req.user._id.toString(),
        courseName: course.title
      },
      customer_email: req.user.email,
      billing_address_collection: 'auto',
    });

    // Create payment record
    await Payment.create({
      user: req.user._id,
      course: course._id,
      stripePaymentIntentId: session.id,
      amount: amount / 100, // Store in rupees
      currency: 'inr',
      status: 'pending',
      paymentMethod: 'card' // Stripe Checkout uses card payment
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: session.id,
        sessionId: session.id,
        url: session.url,
        amount: amount / 100,
        course: {
          id: course._id,
          title: course.title,
          price: course.price,
          discountPrice: course.discountPrice,
          thumbnail: course.thumbnail
        }
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Confirm payment (Checkout Session)
// @route   POST /api/payments/confirm
// @access  Private (Student)
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body; // This is actually a session ID

    // Retrieve Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(paymentIntentId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Checkout session not found'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Check if payment belongs to current user
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    if (session.payment_status === 'paid') {
      // Update payment status
      payment.status = 'succeeded';
      payment.receiptUrl = session.receipt_url || '';
      await payment.save();

      // Get course
      const course = await Course.findById(payment.course);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if already enrolled
      const alreadyEnrolled = course.enrolledStudents.some(
        enrollment => enrollment.student.toString() === req.user._id.toString()
      );

      if (!alreadyEnrolled) {
        // Enroll student in course
        course.enrolledStudents.push({
          student: req.user._id,
          enrolledAt: new Date(),
          progress: 0
        });
        course.totalEnrollments = (course.totalEnrollments || 0) + 1;
        await course.save();

        // Add course to user's enrolled courses
        await User.findByIdAndUpdate(
          req.user._id,
          {
            $addToSet: {
              enrolledCourses: {
                course: course._id,
                enrolledAt: new Date()
              }
            }
          }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Payment successful and enrolled in course',
        data: {
          payment: {
            id: payment._id,
            amount: payment.amount,
            status: payment.status
          },
          course: {
            id: course._id,
            title: course.title
          }
        }
      });
    } else {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment was not successful',
        data: {
          status: session.payment_status
        }
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: req.user._id })
      .populate('course', 'title thumbnail price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update payment record
        const payment = await Payment.findOne({ 
          stripePaymentIntentId: paymentIntent.id 
        });
        
        if (payment && payment.status !== 'succeeded') {
          payment.status = 'succeeded';
          payment.paymentMethod = paymentIntent.payment_method;
          await payment.save();

          // Enroll student if not already enrolled
          const course = await Course.findById(payment.course);
          const user = await User.findById(payment.user);
          
          const isEnrolled = course.enrolledStudents.some(
            enrollment => enrollment.student.toString() === payment.user.toString()
          );

          if (!isEnrolled) {
            await course.enrollStudent(payment.user);
            await User.findByIdAndUpdate(
              payment.user,
              {
                $push: {
                  enrolledCourses: {
                    course: course._id,
                    enrolledAt: new Date()
                  }
                }
              }
            );
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: failedPayment.id },
          { status: 'failed' }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.refundPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund successful payments'
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      reason: 'requested_by_customer'
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = refund.amount / 100;
    payment.refundReason = reason;
    await payment.save();

    // Remove student from course
    const course = await Course.findById(payment.course);
    course.enrolledStudents = course.enrolledStudents.filter(
      enrollment => enrollment.student.toString() !== payment.user.toString()
    );
    course.totalEnrollments = Math.max(0, course.totalEnrollments - 1);
    course.totalRevenue = Math.max(0, course.totalRevenue - payment.amount);
    await course.save();

    // Remove course from user's enrolled courses
    await User.findByIdAndUpdate(
      payment.user,
      {
        $pull: {
          enrolledCourses: { course: payment.course }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
