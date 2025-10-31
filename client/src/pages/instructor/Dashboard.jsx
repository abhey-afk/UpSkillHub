import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { courseAPI, analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, coursesResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        courseAPI.getInstructorCourses()
      ]);

      setStats(statsResponse.data.data);
      setCourses(coursesResponse.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAICourse = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a course description');
      return;
    }

    try {
      setAiLoading(true);
      const response = await courseAPI.generateCourseWithAI(aiPrompt);
      toast.success('AI course generated successfully!');
      setShowAIModal(false);
      setAiPrompt('');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate course');
    } finally {
      setAiLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'primary', trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-luxury"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-dark-900 mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`bg-${color}-100 p-3 rounded-xl`}>
          <div className={`text-${color}-600`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const CourseCard = ({ course }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-luxury group"
    >
      <div className="relative">
        <img
          src={course.thumbnail?.url}
          alt={course.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          {course.isAIGenerated && (
            <div className="bg-purple-500 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI</span>
            </div>
          )}
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            course.isPublished 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {course.isPublished ? 'Published' : 'Draft'}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-dark-900 mb-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-dark-900">{course.totalEnrollments}</p>
            <p className="text-gray-600">Students</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-dark-900">{course.averageRating.toFixed(1)}</p>
            <p className="text-gray-600">Rating</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-dark-900">${course.totalRevenue}</p>
            <p className="text-gray-600">Revenue</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{course.averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({course.totalRatings})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Manage your courses and track your success
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAIModal(true)}
              className="btn-luxury flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate with AI</span>
            </button>
            <Link to="/instructor/courses/create" className="btn-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Course</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Total Courses"
            value={stats.totalCourses || 0}
            trend="+12% this month"
            color="primary"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Students"
            value={stats.totalStudents || 0}
            trend="+8% this month"
            color="blue"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Revenue"
            value={`$${stats.totalRevenue || 0}`}
            trend="+15% this month"
            color="green"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            title="Average Rating"
            value={stats.averageRating?.toFixed(1) || '0.0'}
            subtitle="Across all courses"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-dark-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/instructor/courses/create"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-dark-900">Create Course</h3>
                <p className="text-sm text-gray-600">Start a new course</p>
              </div>
            </Link>
            
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-dark-900">AI Generator</h3>
                <p className="text-sm text-gray-600">Generate with AI</p>
              </div>
            </button>
            
            <Link
              to="/instructor/analytics"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-dark-900">Analytics</h3>
                <p className="text-sm text-gray-600">View detailed stats</p>
              </div>
            </Link>
            
            <Link
              to="/instructor/students"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-dark-900">Students</h3>
                <p className="text-sm text-gray-600">Manage students</p>
              </div>
            </Link>
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-dark-900">My Courses</h2>
            <Link to="/instructor/courses" className="text-primary-600 hover:text-primary-700 font-medium">
              View All Courses {'>'}
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-6">Create your first course to start teaching</p>
              <div className="flex justify-center space-x-4">
                <Link to="/instructor/courses/create" className="btn-primary">
                  Create Course
                </Link>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="btn-luxury flex items-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Generate with AI</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Course Generation Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-dark-900">Generate Course with AI</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Describe the course you want to create and our AI will generate a complete course structure for you.
              </p>
              
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Create a beginner-friendly course about React.js that covers components, state management, and hooks..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={aiLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAICourse}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="flex-1 btn-luxury disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Generate Course'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
