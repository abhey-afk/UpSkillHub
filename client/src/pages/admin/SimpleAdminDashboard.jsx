import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const SimpleAdminDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Simple stats without API calls for testing
  const stats = {
    totalUsers: 1,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 1,
    newUsersThisMonth: 1,
    coursesThisMonth: 0,
    revenueThisMonth: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-dark-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg lg:text-xl text-gray-600">
              Welcome back, {user?.name}! Manage your platform and monitor performance
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg flex-shrink-0">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin Access</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Users</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs lg:text-sm text-green-600 truncate">+{stats.newUsersThisMonth} this month</p>
              </div>
              <Users className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Courses</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-xs lg:text-sm text-green-600 truncate">+{stats.coursesThisMonth} this month</p>
              </div>
              <BookOpen className="w-10 h-10 lg:w-12 lg:h-12 text-green-500 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">${stats.totalRevenue}</p>
                <p className="text-xs lg:text-sm text-green-600 truncate">${stats.revenueThisMonth} this month</p>
              </div>
              <DollarSign className="w-10 h-10 lg:w-12 lg:h-12 text-yellow-500 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Active Users</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                <p className="text-xs lg:text-sm text-gray-500 truncate">Last 30 days</p>
              </div>
              <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-purple-500 flex-shrink-0" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-dark-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/courses"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-orange-500" />
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-900">Review Pending Courses</h3>
                <p className="text-sm text-gray-600">Approve or reject instructor submissions</p>
              </div>
            </Link>
            
            <Link
              to="/admin/users"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Users className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-dark-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </Link>
            
            <Link
              to="/admin/analytics"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-dark-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Detailed platform statistics</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Admin Login Successful! SUCCESS</h3>
              <p className="text-green-700">
                You are now logged in as an administrator. You can access the course management system 
                to review and approve instructor submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminDashboard;
