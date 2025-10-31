const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fetch = require('node-fetch');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Google AI API endpoint (using the working model)
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const {
      category,
      level,
      minPrice,
      maxPrice,
      rating,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build query - only show approved courses to public
    let query = { isPublished: true, approvalStatus: 'approved' };

    if (category) query.category = category;
    if (level) query.level = level;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.averageRating = { $gte: Number(rating) };
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortBy = {};
    switch (sort) {
      case 'price_low':
        sortBy.price = 1;
        break;
      case 'price_high':
        sortBy.price = -1;
        break;
      case 'rating':
        sortBy.averageRating = -1;
        break;
      case 'popular':
        sortBy.totalEnrollments = -1;
        break;
      case 'newest':
        sortBy.createdAt = -1;
        break;
      default:
        sortBy.createdAt = -1;
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar bio')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-lessons.quiz -enrolledStudents');

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName avatar bio socialLinks')
      .populate('ratings.user', 'firstName lastName avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    if (req.user) {
      isEnrolled = course.enrolledStudents.some(
        enrollment => enrollment.student.toString() === req.user._id.toString()
      );
    }

    res.status(200).json({
      success: true,
      data: { 
        course: {
          ...course.toObject(),
          isEnrolled
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Handle image upload if present
    if (req.files && req.files.image) {
      try {
        const imageResult = await uploadToCloudinary(req.files.image.tempFilePath, {
          folder: `upskillhub/courses`,
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        });
        
        req.body.image = {
          url: imageResult.url,
          public_id: imageResult.public_id,
          width: imageResult.width,
          height: imageResult.height,
          format: imageResult.format
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading course image',
          error: error.message
        });
      }
    }

    // Add instructor to course
    req.body.instructor = req.user._id;

    const course = await Course.create(req.body);

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdCourses: course._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Course Owner/Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    // Handle image upload if new image is provided
    if (req.files && req.files.image) {
      try {
        // Delete old image if exists
        if (course.image && course.image.public_id) {
          await deleteFromCloudinary(course.image.public_id, {
            resource_type: 'image'
          });
        }
        
        // Upload new image
        const imageResult = await uploadToCloudinary(req.files.image.tempFilePath, {
          folder: `upskillhub/courses`,
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        });
        
        req.body.image = {
          url: imageResult.url,
          public_id: imageResult.public_id,
          width: imageResult.width,
          height: imageResult.height,
          format: imageResult.format
        };
      } catch (error) {
        console.error('Error updating image:', error);
        return res.status(500).json({
          success: false,
          message: 'Error updating course image',
          error: error.message
        });
      }
    }

    // If image is being removed
    if (req.body.removeImage === 'true' && course.image && course.image.public_id) {
      try {
        await deleteFromCloudinary(course.image.public_id, {
          resource_type: 'image'
        });
        req.body.image = null;
      } catch (error) {
        console.error('Error removing image:', error);
        // Continue with the update even if image deletion fails
      }
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('instructor', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Course Owner/Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Remove course from instructor's created courses
    await User.findByIdAndUpdate(
      course.instructor,
      { $pull: { createdCourses: course._id } }
    );

    // Remove course from all enrolled students
    await User.updateMany(
      { 'enrolledCourses.course': course._id },
      { $pull: { enrolledCourses: { course: course._id } } }
    );

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published yet'
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

    // Enroll student
    await course.enrollStudent(req.user._id);

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          enrolledCourses: {
            course: course._id,
            enrolledAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private (Student)
exports.getEnrolledCourses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        populate: {
          path: 'instructor',
          select: 'firstName lastName avatar'
        }
      });

    res.status(200).json({
      success: true,
      data: { courses: user.enrolledCourses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add course rating
// @route   POST /api/courses/:id/rating
// @access  Private (Enrolled Student)
exports.addRating = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to rate this course'
      });
    }

    await course.addRating(req.user._id, rating, review);

    res.status(200).json({
      success: true,
      message: 'Rating added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate course with AI
// @route   POST /api/courses/generate-ai
// @access  Private (Instructor/Admin)
exports.generateCourseWithAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Generate course content with Google AI using REST API
    const systemPrompt = `You are an expert course creator. Generate a comprehensive course structure based on the user's prompt. Return ONLY a valid JSON object with the following structure:
    {
      "title": "Course Title",
      "description": "Detailed course description",
      "shortDescription": "Brief description",
      "category": "One of: Programming, Design, Business, Marketing, Data Science, Photography, Music, Language, Health & Fitness, Personal Development",
      "subcategory": "Specific subcategory",
      "level": "Beginner, Intermediate, or Advanced",
      "price": 99,
      "whatYouWillLearn": ["Learning outcome 1", "Learning outcome 2"],
      "requirements": ["Requirement 1", "Requirement 2"],
      "lessons": [
        {
          "title": "Lesson Title",
          "description": "Lesson description",
          "duration": 30,
          "videoUrl": "https://www.youtube.com/watch?v=dGcsHMXbSOA",
          "order": 1
        }
      ],
      "tags": ["tag1", "tag2"]
    }`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;
    
    // Add retry logic for API calls
    let response;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        response = await fetch(`${GOOGLE_AI_API_URL}?key=${process.env.GOOGLE_AI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });

        if (response.ok) {
          break; // Success, exit retry loop
        }

        // Handle specific error codes
        if (response.status === 503) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Google AI API temporarily unavailable, retrying... (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts)); // Wait 2s, 4s, 6s
            continue;
          }
        }

        // For other errors, don't retry
        const errorData = await response.text();
        throw new Error(`Google AI API error: ${response.status} ${response.statusText}. Details: ${errorData}`);
        
      } catch (fetchError) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to connect to Google AI API after ${maxAttempts} attempts: ${fetchError.message}`);
        }
        console.log(`Network error, retrying... (${attempts}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    const data = await response.json();
    
    // Check if response has the expected structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Invalid response structure from Google AI API');
    }
    
    const text = data.candidates[0].content.parts[0].text;

    let courseData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      courseData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response'
      });
    }

    // Add additional fields
    courseData.instructor = req.user._id;
    courseData.isAIGenerated = true;
    courseData.aiPrompt = prompt;
    courseData.thumbnail = {
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
    };

    // Create the course
    const course = await Course.create(courseData);

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdCourses: course._id } }
    );

    res.status(201).json({
      success: true,
      message: 'AI course generated successfully',
      data: { course }
    });
  } catch (error) {
    console.error('AI Course Generation Error:', error.message);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        message: 'AI service quota exceeded. Please try again later.'
      });
    }
    
    if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
      return res.status(503).json({
        success: false,
        message: 'Google AI service is temporarily unavailable. Please try again in a few minutes.',
        details: 'The AI service is experiencing high traffic. Please wait a moment and try again.'
      });
    }
    
    if (error.message.includes('API error')) {
      return res.status(500).json({
        success: false,
        message: 'AI service error. Please check your configuration and try again.',
        details: error.message
      });
    }
    
    next(error);
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor
// @access  Private (Instructor)
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending courses for admin review
// @route   GET /api/courses/admin/pending
// @access  Private (Admin)
exports.getPendingCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ approvalStatus: 'pending' })
      .populate('instructor', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a course
// @route   PUT /api/courses/admin/:id/approve
// @access  Private (Admin)
exports.approveCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.approvalStatus = 'approved';
    course.approvedBy = req.user._id;
    course.approvedAt = new Date();
    course.isPublished = true; // Auto-publish when approved

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course approved successfully',
      data: { course }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a course
// @route   PUT /api/courses/admin/:id/reject
// @access  Private (Admin)
exports.rejectCourse = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.approvalStatus = 'rejected';
    course.rejectionReason = reason;
    course.approvedBy = req.user._id;
    course.approvedAt = new Date();

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course rejected successfully',
      data: { course }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses for admin (including pending/rejected)
// @route   GET /api/courses/admin/all
// @access  Private (Admin)
exports.getAllCoursesForAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;
    
    let query = {};
    if (status) {
      query.approvalStatus = status;
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
exports.getFeaturedCourses = async (req, res, next) => {
  try {
    const courses = await Course.getFeaturedCourses();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top-rated courses
// @route   GET /api/courses/top-rated
// @access  Public
exports.getTopRatedCourses = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const courses = await Course.getTopRatedCourses(Number(limit));

    res.status(200).json({
      success: true,
      count: courses.length,
      data: { courses }
    });
  } catch (error) {
    next(error);
  }
};
