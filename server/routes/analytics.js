const express = require('express');
const {
  getDashboardStats,
  getCourseAnalytics,
  getUserAnalytics,
  getRevenueAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// General dashboard stats (all roles)
router.get('/dashboard', getDashboardStats);

// User analytics (students can see their own, instructors/admins can see all)
router.get('/users', getUserAnalytics);

// Course analytics (instructors can see their courses, admins can see all)
router.get('/courses/:id', authorize('instructor', 'admin'), getCourseAnalytics);

// Revenue analytics (admin only)
router.get('/revenue', authorize('admin'), getRevenueAnalytics);

module.exports = router;
