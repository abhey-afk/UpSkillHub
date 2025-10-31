const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let stats = {};

    if (userRole === 'admin') {
      // Admin dashboard stats
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalRevenue = await Payment.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalRevenueAmount = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
      
      const activeUsers = await User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      const newUsersThisMonth = await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      });

      const coursesThisMonth = await Course.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      });

      const revenueThisMonth = await Payment.aggregate([
        {
          $match: {
            status: 'succeeded',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const revenueThisMonthAmount = revenueThisMonth.length > 0 ? revenueThisMonth[0].total : 0;

      stats = {
        totalUsers,
        totalCourses,
        totalRevenue: totalRevenueAmount,
        activeUsers,
        newUsersThisMonth,
        coursesThisMonth,
        revenueThisMonth: revenueThisMonthAmount
      };

    } else if (userRole === 'instructor') {
      // Instructor dashboard stats
      const instructorCourses = await Course.find({ instructor: req.user._id });
      const totalCourses = instructorCourses.length;
      const totalStudents = instructorCourses.reduce((sum, course) => sum + course.totalEnrollments, 0);
      const totalRevenue = instructorCourses.reduce((sum, course) => sum + course.totalRevenue, 0);
      const averageRating = instructorCourses.length > 0 
        ? instructorCourses.reduce((sum, course) => sum + course.averageRating, 0) / instructorCourses.length
        : 0;

      stats = {
        totalCourses,
        totalStudents,
        totalRevenue,
        averageRating
      };

    } else if (userRole === 'student') {
      // Student dashboard stats
      const user = await User.findById(req.user._id);
      const totalCourses = user.enrolledCourses.length;
      const completedCourses = user.enrolledCourses.filter(course => course.completed).length;
      const totalHours = 0; // This would need to be calculated based on course progress
      const averageProgress = totalCourses > 0 
        ? user.enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / totalCourses
        : 0;

      stats = {
        totalCourses,
        completedCourses,
        totalHours,
        averageProgress
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course analytics
// @route   GET /api/analytics/courses/:id
// @access  Private (Instructor/Admin)
exports.getCourseAnalytics = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.student', 'firstName lastName email')
      .populate('ratings.user', 'firstName lastName');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user owns the course or is admin
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this course analytics'
      });
    }

    // Calculate analytics
    const totalEnrollments = course.enrolledStudents.length;
    const completedStudents = course.enrolledStudents.filter(student => student.completed).length;
    const completionRate = totalEnrollments > 0 ? (completedStudents / totalEnrollments * 100).toFixed(1) : 0;
    
    const averageProgress = totalEnrollments > 0 
      ? course.enrolledStudents.reduce((sum, student) => sum + student.progress, 0) / totalEnrollments
      : 0;

    // Enrollment trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEnrollments = course.enrolledStudents.filter(
      student => new Date(student.enrolledAt) >= thirtyDaysAgo
    ).length;

    // Rating distribution
    const ratingDistribution = {
      5: course.ratings.filter(r => r.rating === 5).length,
      4: course.ratings.filter(r => r.rating === 4).length,
      3: course.ratings.filter(r => r.rating === 3).length,
      2: course.ratings.filter(r => r.rating === 2).length,
      1: course.ratings.filter(r => r.rating === 1).length
    };

    const analytics = {
      courseInfo: {
        title: course.title,
        totalEnrollments,
        averageRating: course.averageRating,
        totalRatings: course.totalRatings,
        totalRevenue: course.totalRevenue
      },
      performance: {
        completionRate: `${completionRate}%`,
        averageProgress: `${averageProgress.toFixed(1)}%`,
        recentEnrollments
      },
      ratings: {
        distribution: ratingDistribution,
        recentReviews: course.ratings.slice(-5).reverse()
      },
      students: {
        enrolled: course.enrolledStudents.slice(-10).reverse(),
        totalCount: totalEnrollments,
        completedCount: completedStudents
      }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private
exports.getUserAnalytics = async (req, res, next) => {
  try {
    let analytics = {};

    if (req.user.role === 'admin') {
      // Admin can see all user analytics
      const userGrowth = await User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]);

      const usersByRole = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      const activeUsers = await User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      analytics = {
        userGrowth,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        activeUsers,
        totalUsers: await User.countDocuments()
      };

    } else if (req.user.role === 'student') {
      // Student can see their own analytics
      const user = await User.findById(req.user._id)
        .populate('enrolledCourses.course', 'title category');

      const learningProgress = user.enrolledCourses.map(enrollment => ({
        courseTitle: enrollment.course.title,
        category: enrollment.course.category,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completed: enrollment.completed
      }));

      const categoryProgress = user.enrolledCourses.reduce((acc, enrollment) => {
        const category = enrollment.course.category;
        if (!acc[category]) {
          acc[category] = { total: 0, completed: 0, averageProgress: 0 };
        }
        acc[category].total += 1;
        if (enrollment.completed) acc[category].completed += 1;
        acc[category].averageProgress += enrollment.progress;
        return acc;
      }, {});

      // Calculate average progress per category
      Object.keys(categoryProgress).forEach(category => {
        categoryProgress[category].averageProgress = 
          categoryProgress[category].averageProgress / categoryProgress[category].total;
      });

      analytics = {
        learningProgress,
        categoryProgress,
        totalCourses: user.enrolledCourses.length,
        completedCourses: user.enrolledCourses.filter(c => c.completed).length
      };

    } else if (req.user.role === 'instructor') {
      // Instructor can see their teaching analytics
      const courses = await Course.find({ instructor: req.user._id });
      
      const teachingStats = {
        totalCourses: courses.length,
        totalStudents: courses.reduce((sum, course) => sum + course.totalEnrollments, 0),
        totalRevenue: courses.reduce((sum, course) => sum + course.totalRevenue, 0),
        averageRating: courses.length > 0 
          ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length
          : 0
      };

      const coursePerformance = courses.map(course => ({
        title: course.title,
        enrollments: course.totalEnrollments,
        rating: course.averageRating,
        revenue: course.totalRevenue
      }));

      analytics = {
        teachingStats,
        coursePerformance
      };
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private (Admin)
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    // Monthly revenue for the last 12 months
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Revenue by course
    const revenueByCourse = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: '$course',
          revenue: { $sum: '$amount' },
          sales: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Total revenue stats
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          transactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    const analytics = {
      monthlyRevenue,
      revenueByCourse: revenueByCourse.map(item => ({
        courseTitle: item.course.title,
        revenue: item.revenue,
        sales: item.sales,
        averagePrice: item.revenue / item.sales
      })),
      totalStats: totalRevenue[0] || { total: 0, transactions: 0, averageTransaction: 0 }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};
