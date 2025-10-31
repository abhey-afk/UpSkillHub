import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseAPI } from '../../services/api';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = filter === 'pending' 
        ? await courseAPI.getPendingCourses()
        : await courseAPI.getAllCoursesForAdmin({ status: filter });
      
      setCourses(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await courseAPI.approveCourse(courseId);
      toast.success('Course approved successfully!');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve course');
    }
  };

  const handleRejectCourse = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await courseAPI.rejectCourse(selectedCourse._id, { reason: rejectionReason });
      toast.success('Course rejected successfully!');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject course');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
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
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-dark-900 mb-2">
            Course Management
          </h1>
          <p className="text-lg lg:text-xl text-gray-600">
            Review and manage course submissions from instructors
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field w-auto"
              >
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="">All Courses</option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600">
                {filter === 'pending' 
                  ? 'No courses are currently pending review.'
                  : `No ${filter} courses found.`
                }
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-dark-900">
                        {course.title}
                      </h3>
                      <div className={getStatusBadge(course.approvalStatus)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(course.approvalStatus)}
                          <span className="capitalize">{course.approvalStatus}</span>
                        </div>
                      </div>
                      {course.isAIGenerated && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          AI Generated
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.shortDescription}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {course.instructor?.firstName} {course.instructor?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">₹{course.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{course.level}</span>
                      </div>
                    </div>

                    {course.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {course.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <button
                      onClick={() => window.open(`/courses/${course._id}`, '_blank')}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>Preview</span>
                    </button>

                    {course.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveCourse(course._id)}
                          className="btn-success flex items-center space-x-2"
                        >
                          <Check size={16} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowRejectModal(true);
                          }}
                          className="btn-danger flex items-center space-x-2"
                        >
                          <X size={16} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">
                Reject Course
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting "{selectedCourse?.title}":
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="input-field w-full mb-4 resize-none"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedCourse(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectCourse}
                  className="btn-danger flex-1"
                >
                  Reject Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
