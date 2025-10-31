const express = require('express');
const { body } = require('express-validator');
const { 
  uploadLecture, 
  getLectures, 
  updateLecture, 
  deleteLecture 
} = require('../controllers/lectureController');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  getInstructorCourses,
  addRating,
  generateCourseWithAI,
  getFeaturedCourses,
  getTopRatedCourses,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAllCoursesForAdmin
} = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createCourseValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('shortDescription')
    .trim()
    .isLength({ min: 20, max: 200 })
    .withMessage('Short description must be between 20 and 200 characters'),
  body('category')
    .isIn(['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Photography', 'Music', 'Language', 'Health & Fitness', 'Personal Development'])
    .withMessage('Please select a valid category'),
  body('subcategory')
    .trim()
    .notEmpty()
    .withMessage('Subcategory is required'),
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Please select a valid level'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('whatYouWillLearn')
    .isArray({ min: 3 })
    .withMessage('At least 3 learning outcomes are required'),
  body('thumbnail.url')
    .isURL()
    .withMessage('Valid thumbnail URL is required')
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
];

const aiGenerationValidation = [
  body('prompt')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Prompt must be between 10 and 500 characters')
];

// Public routes
router.get('/featured', getFeaturedCourses);
router.get('/top-rated', getTopRatedCourses);
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes
router.use(protect); // All routes below require authentication

// Student routes
router.get('/enrolled/my-courses', authorize('student'), getEnrolledCourses);
router.post('/:id/enroll', authorize('student'), enrollInCourse);
router.post('/:id/rating', authorize('student'), ratingValidation, addRating);

// Instructor routes
router.get('/instructor/my-courses', authorize('instructor', 'admin'), getInstructorCourses);
router.post(
  '/',
  protect,
  authorize('instructor', 'admin'),
  createCourseValidation,
  createCourse
);
router.put(
  '/:id',
  authorize('instructor', 'admin'),
  updateCourse
);
router.delete('/:id', authorize('instructor', 'admin'), deleteCourse);
router.post('/generate-ai', authorize('instructor', 'admin'), aiGenerationValidation, generateCourseWithAI);

// Admin routes for course management
router.get('/admin/pending', authorize('admin'), getPendingCourses);
router.get('/admin/all', authorize('admin'), getAllCoursesForAdmin);
router.put('/admin/:id/approve', authorize('admin'), approveCourse);
router.put('/admin/:id/reject', authorize('admin'), rejectCourse);

// Lecture routes
router.route('/:courseId/lectures')
  .get(protect, getLectures)
  .post(
    protect,
    authorize('instructor', 'admin'),
    uploadLecture
  );

router.route('/lectures/:id')
  .put(
    protect,
    authorize('instructor', 'admin'),
    updateLecture
  )
  .delete(
    protect,
    authorize('instructor', 'admin'),
    deleteLecture
  );

module.exports = router;
