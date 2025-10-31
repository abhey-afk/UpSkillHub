const express = require('express');
const { body } = require('express-validator');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  handleWebhook,
  refundPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createPaymentValidation = [
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required')
];

const confirmPaymentValidation = [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required')
];

const refundValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
];

// Webhook route (must be before other middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

// Student routes
router.post('/create-intent', authorize('student'), createPaymentValidation, createPaymentIntent);
router.post('/confirm', authorize('student'), confirmPaymentValidation, confirmPayment);
router.get('/history', getPaymentHistory);

// Admin routes
router.post('/:id/refund', authorize('admin'), refundValidation, refundPayment);

module.exports = router;
