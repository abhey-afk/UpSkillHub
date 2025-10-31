import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play,
  Star,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { courseAPI, analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, statsResponse] = await Promise.all([
        courseAPI.getEnrolledCourses(),
        analyticsAPI.getDashboardStats()
      ]);

      setEnrolledCourses(coursesResponse.data.data.courses);
      setStats(statsResponse.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
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
      className="card-luxury group hover:scale-105 transition-transform duration-300"
    >
      <div className="relative">
        <img
          src={course.course?.thumbnail?.url}
          alt={course.course?.title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm">
          {course.progress}% Complete
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-dark-900 mb-2 group-hover:text-primary-600 transition-colors">
          {course.course?.title}
        </h3>

        <div className="flex items-center space-x-2 mb-3">
          <img
            src={course.course?.instructor?.avatar?.url}
            alt={course.course?.instructor?.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600">{course.course?.instructor?.name}</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{course.course?.totalDuration}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.course?.totalLessons} lessons</span>
            </div>
          </div>
          
          <Link
            to={`/courses/${course.course?._id}`}
            className="btn-primary text-sm"
          >
            {course.progress === 100 ? 'Review' : 'Continue'}
          </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-64 rounded-xl"></div>
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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-dark-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xl text-gray-600">
            Continue your learning journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Enrolled Courses"
            value={stats.totalCourses || enrolledCourses.length}
            color="primary"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Completed"
            value={stats.completedCourses || enrolledCourses.filter(c => c.completed).length}
            color="luxury"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Learning Hours"
            value={stats.totalHours || 0}
            subtitle="This month"
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Progress"
            value={`${Math.round(stats.averageProgress || 0)}%`}
            subtitle="Average"
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-dark-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courses"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="font-semibold text-dark-900">Browse Courses</h3>
                <p className="text-sm text-gray-600">Discover new courses</p>
              </div>
            </Link>
            
            <Link
              to="/certificates"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-luxury-300 hover:bg-luxury-50 transition-colors"
            >
              <Award className="w-8 h-8 text-luxury-600" />
              <div>
                <h3 className="font-semibold text-dark-900">My Certificates</h3>
                <p className="text-sm text-gray-600">View achievements</p>
              </div>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <User className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-dark-900">Profile Settings</h3>
                <p className="text-sm text-gray-600">Update your profile</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-dark-900">My Courses</h2>
            <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium">
              Browse All Courses {'>'}
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
              <Link to="/courses" className="btn-luxury">
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-dark-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {enrolledCourses.slice(0, 5).map((course, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-primary-100 p-2 rounded-lg">
                  <Play className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-900">
                    Continued learning "{course.course?.title}"
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(course.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {course.progress}% complete
                </div>
              </div>
            ))}
            
            {enrolledCourses.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
