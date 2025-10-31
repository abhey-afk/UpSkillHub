import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle, 
  Globe,
  Award,
  User,
  DollarSign,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { courseAPI, paymentAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RQl3r4eFZhmwmhdCv6hhSodJVFuQgTsb6L7jA7fP5vU8dpI0NSlo1pGB0AirkR2xFTN641KNEhWqp0Wen5QWNAL00dvjWZ2YM');

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Dummy course details - matches the home page dummy courses
  const dummyCourseDetails = {
    '1': {
      _id: '1',
      title: 'Complete Web Development Bootcamp',
      shortDescription: 'Master HTML, CSS, JavaScript, React, Node.js and become a full-stack developer',
      description: 'This comprehensive web development bootcamp will take you from beginner to advanced level. You\'ll learn modern web technologies including HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, and MongoDB. Build real-world projects and deploy them to production.',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      instructor: { firstName: 'John', lastName: 'Smith', bio: 'Senior Full-Stack Developer with 10+ years of experience in web development and teaching.' },
      price: 3999,
      level: 'Beginner',
      category: 'Web Development',
      language: 'English',
      totalEnrollments: 15420,
      whatYouWillLearn: [
        'Build responsive websites with HTML5 and CSS3',
        'Master JavaScript and modern ES6+ features',
        'Create dynamic web apps with React',
        'Build RESTful APIs with Node.js and Express',
        'Work with MongoDB and database design',
        'Deploy applications to production'
      ],
      requirements: [
        'Basic computer skills',
        'No prior programming experience required',
        'A computer with internet connection'
      ],
      lessons: [
        { order: 1, title: 'Introduction to Web Development', description: 'Overview of web technologies and tools', duration: 30 },
        { order: 2, title: 'HTML Fundamentals', description: 'Learn HTML tags, elements, and structure', duration: 45 },
        { order: 3, title: 'CSS Styling', description: 'Master CSS selectors, properties, and layouts', duration: 60 },
        { order: 4, title: 'JavaScript Basics', description: 'Variables, functions, and control flow', duration: 75 },
        { order: 5, title: 'React Introduction', description: 'Components, props, and state management', duration: 90 },
        { order: 6, title: 'Node.js Backend', description: 'Server-side JavaScript and APIs', duration: 80 }
      ]
    },
    '2': {
      _id: '2',
      title: 'Python for Data Science & Machine Learning',
      shortDescription: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn and build ML models',
      description: 'Dive deep into data science and machine learning with Python. Master essential libraries like NumPy, Pandas, Matplotlib, and Scikit-Learn. Build real machine learning models and analyze complex datasets.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
      instructor: { firstName: 'Sarah', lastName: 'Williams', bio: 'Data Scientist and ML Engineer with expertise in Python and statistical modeling.' },
      price: 4999,
      level: 'Intermediate',
      category: 'Data Science',
      language: 'English',
      totalEnrollments: 12350,
      whatYouWillLearn: [
        'Python programming fundamentals',
        'Data manipulation with Pandas',
        'Data visualization with Matplotlib and Seaborn',
        'Machine learning algorithms',
        'Build predictive models',
        'Deploy ML models to production'
      ],
      requirements: [
        'Basic programming knowledge helpful',
        'Understanding of mathematics',
        'Python installed on your computer'
      ],
      lessons: [
        { order: 1, title: 'Python Basics', description: 'Variables, data types, and functions', duration: 40 },
        { order: 2, title: 'NumPy Arrays', description: 'Working with numerical data', duration: 50 },
        { order: 3, title: 'Pandas DataFrames', description: 'Data manipulation and analysis', duration: 60 },
        { order: 4, title: 'Data Visualization', description: 'Creating charts and graphs', duration: 45 },
        { order: 5, title: 'Machine Learning Basics', description: 'Introduction to ML algorithms', duration: 70 }
      ]
    },
    '3': {
      _id: '3',
      title: 'UI/UX Design Masterclass',
      shortDescription: 'Master Figma, Adobe XD, user research, wireframing, and prototyping',
      description: 'Learn the complete UI/UX design process from research to final design. Master industry-standard tools like Figma and Adobe XD. Create beautiful, user-friendly interfaces.',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      instructor: { firstName: 'Emily', lastName: 'Chen', bio: 'Senior UI/UX Designer with 8 years of experience designing for Fortune 500 companies.' },
      price: 3499,
      level: 'Beginner',
      category: 'Design',
      language: 'English',
      totalEnrollments: 9870,
      whatYouWillLearn: [
        'User research and personas',
        'Wireframing and prototyping',
        'UI design principles',
        'Master Figma and Adobe XD',
        'Design systems and components',
        'Usability testing'
      ],
      requirements: [
        'No prior design experience needed',
        'Computer with Figma installed',
        'Creative mindset'
      ],
      lessons: [
        { order: 1, title: 'Introduction to UI/UX', description: 'Understanding user-centered design', duration: 35 },
        { order: 2, title: 'User Research', description: 'Conducting interviews and surveys', duration: 40 },
        { order: 3, title: 'Wireframing', description: 'Creating low-fidelity designs', duration: 50 },
        { order: 4, title: 'Figma Fundamentals', description: 'Mastering the Figma interface', duration: 55 },
        { order: 5, title: 'High-Fidelity Design', description: 'Creating polished UI designs', duration: 60 }
      ]
    },
    '4': {
      _id: '4',
      title: 'Digital Marketing Complete Course',
      shortDescription: 'SEO, Social Media Marketing, Email Marketing, Google Ads & Analytics',
      description: 'Master digital marketing strategies including SEO, social media, email marketing, and paid advertising. Learn to create effective campaigns and measure ROI.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      instructor: { firstName: 'Michael', lastName: 'Brown', bio: 'Digital Marketing Expert with 12 years helping businesses grow online.' },
      price: 2999,
      level: 'Beginner',
      category: 'Marketing',
      language: 'English',
      totalEnrollments: 11200,
      whatYouWillLearn: [
        'SEO optimization techniques',
        'Social media marketing strategies',
        'Email marketing campaigns',
        'Google Ads and PPC',
        'Analytics and reporting',
        'Content marketing'
      ],
      requirements: [
        'Basic internet knowledge',
        'No marketing experience required',
        'Willingness to learn'
      ],
      lessons: [
        { order: 1, title: 'Digital Marketing Overview', description: 'Introduction to online marketing', duration: 30 },
        { order: 2, title: 'SEO Fundamentals', description: 'Search engine optimization basics', duration: 55 },
        { order: 3, title: 'Social Media Strategy', description: 'Creating engaging content', duration: 45 },
        { order: 4, title: 'Google Ads', description: 'Running paid campaigns', duration: 50 },
        { order: 5, title: 'Analytics', description: 'Measuring campaign success', duration: 40 }
      ]
    },
    '5': {
      _id: '5',
      title: 'Mobile App Development with React Native',
      shortDescription: 'Build iOS and Android apps using React Native and JavaScript',
      description: 'Learn to build cross-platform mobile applications using React Native. Create apps that work on both iOS and Android from a single codebase.',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      instructor: { firstName: 'David', lastName: 'Lee', bio: 'Mobile App Developer specializing in React Native with 50+ published apps.' },
      price: 4499,
      level: 'Intermediate',
      category: 'Mobile Development',
      language: 'English',
      totalEnrollments: 8540,
      whatYouWillLearn: [
        'React Native fundamentals',
        'Building mobile UI components',
        'Navigation and routing',
        'API integration',
        'Publishing to App Store and Play Store',
        'Performance optimization'
      ],
      requirements: [
        'JavaScript knowledge required',
        'React basics helpful',
        'Mac for iOS development (optional)'
      ],
      lessons: [
        { order: 1, title: 'React Native Setup', description: 'Environment configuration', duration: 35 },
        { order: 2, title: 'Components and Props', description: 'Building UI elements', duration: 60 },
        { order: 3, title: 'Navigation', description: 'Screen navigation patterns', duration: 50 },
        { order: 4, title: 'API Integration', description: 'Fetching and displaying data', duration: 65 },
        { order: 5, title: 'Publishing Apps', description: 'Deployment to stores', duration: 45 }
      ]
    },
    '6': {
      _id: '6',
      title: 'AWS Certified Solutions Architect',
      shortDescription: 'Complete AWS certification preparation with hands-on projects',
      description: 'Prepare for the AWS Solutions Architect certification exam. Learn cloud architecture, EC2, S3, RDS, Lambda, and more with hands-on labs.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      instructor: { firstName: 'Robert', lastName: 'Taylor', bio: 'AWS Certified Solutions Architect and cloud infrastructure expert.' },
      price: 5499,
      level: 'Advanced',
      category: 'Cloud Computing',
      language: 'English',
      totalEnrollments: 7320,
      whatYouWillLearn: [
        'AWS core services',
        'Cloud architecture design',
        'Security and compliance',
        'Cost optimization',
        'High availability and scalability',
        'Exam preparation strategies'
      ],
      requirements: [
        'Basic IT knowledge',
        'Understanding of networking',
        'AWS account (free tier available)'
      ],
      lessons: [
        { order: 1, title: 'AWS Fundamentals', description: 'Introduction to cloud computing', duration: 45 },
        { order: 2, title: 'EC2 and Compute', description: 'Virtual servers and instances', duration: 70 },
        { order: 3, title: 'Storage Services', description: 'S3, EBS, and storage options', duration: 60 },
        { order: 4, title: 'Networking', description: 'VPC, subnets, and security groups', duration: 75 },
        { order: 5, title: 'Database Services', description: 'RDS, DynamoDB, and data storage', duration: 65 }
      ]
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Check if this is a dummy course ID
        if (dummyCourseDetails[id]) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          setCourse(dummyCourseDetails[id]);
        } else {
          // Fetch real course from database
          const response = await courseAPI.getCourse(id);
          setCourse(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        // Fallback to dummy data if available
        if (dummyCourseDetails[id]) {
          setCourse(dummyCourseDetails[id]);
        } else {
          toast.error('Failed to load course details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleEnroll = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please login to enroll in this course');
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    // Check if user is a student
    if (user?.role !== 'student') {
      toast.error('Only students can enroll in courses');
      return;
    }

    try {
      setEnrolling(true);
      
      // Create Stripe Checkout Session
      const response = await paymentAPI.createPaymentIntent(id);
      const { url } = response.data.data;

      // Redirect to Stripe Checkout page
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process enrollment');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or is no longer available.</p>
          <Link to="/courses" className="btn-primary">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalDuration = course.lessons?.reduce((total, lesson) => total + (lesson.duration || 0), 0) || 0;
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                {course.title}
              </h1>
              
              <p className="text-xl text-primary-100 mb-6">
                {course.shortDescription}
              </p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{hours}h {minutes}m</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">
                  ₹{course.price}
                </div>
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-luxury flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign size={20} />
                      <span>Enroll Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:flex justify-center">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 max-w-md w-full">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white opacity-80" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Course Preview</h3>
                <p className="text-primary-100 text-sm">
                  Get a glimpse of what you'll learn in this comprehensive course.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Course */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-2xl font-semibold text-dark-900 mb-4">About This Course</h2>
              <p className="text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </motion.div>

            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-2xl font-semibold text-dark-900 mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Course Curriculum */}
            {course.lessons && course.lessons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-2xl font-semibold text-dark-900 mb-4">Course Curriculum</h2>
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div className="flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mb-2 sm:mb-0">
                          {lesson.order || index + 1}
                        </div>
                        <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2 sm:mt-0">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration || 0} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Requirements Section */}
            {course.requirements && course.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-xl font-semibold text-dark-900 mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
