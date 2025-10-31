import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Play, 
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Clock,
  BarChart
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy courses data - will be replaced with real data from database
  const dummyCourses = [
    {
      _id: '1',
      title: 'Complete Web Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript, React, Node.js and become a full-stack developer',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      instructor: { name: 'John Smith' },
      price: 3999,
      level: 'Beginner',
      duration: '40 hours',
      students: 15420,
      rating: 4.8
    },
    {
      _id: '2',
      title: 'Python for Data Science & Machine Learning',
      description: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-Learn and build ML models',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
      instructor: { name: 'Sarah Williams' },
      price: 4999,
      level: 'Intermediate',
      duration: '35 hours',
      students: 12350,
      rating: 4.9
    },
    {
      _id: '3',
      title: 'UI/UX Design Masterclass',
      description: 'Master Figma, Adobe XD, user research, wireframing, and prototyping',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      instructor: { name: 'Emily Chen' },
      price: 3499,
      level: 'Beginner',
      duration: '28 hours',
      students: 9870,
      rating: 4.7
    },
    {
      _id: '4',
      title: 'Digital Marketing Complete Course',
      description: 'SEO, Social Media Marketing, Email Marketing, Google Ads & Analytics',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      instructor: { name: 'Michael Brown' },
      price: 2999,
      level: 'Beginner',
      duration: '32 hours',
      students: 11200,
      rating: 4.6
    },
    {
      _id: '5',
      title: 'Mobile App Development with React Native',
      description: 'Build iOS and Android apps using React Native and JavaScript',
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      instructor: { name: 'David Lee' },
      price: 4499,
      level: 'Intermediate',
      duration: '45 hours',
      students: 8540,
      rating: 4.8
    },
    {
      _id: '6',
      title: 'AWS Certified Solutions Architect',
      description: 'Complete AWS certification preparation with hands-on projects',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      instructor: { name: 'Robert Taylor' },
      price: 5499,
      level: 'Advanced',
      duration: '50 hours',
      students: 7320,
      rating: 4.9
    }
  ];

  useEffect(() => {
    // Simulate fetching courses from database
    // TODO: Replace with actual API call to fetch courses
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For now, use dummy data
        // When ready, replace with: const response = await coursesAPI.getAll();
        setCourses(dummyCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to dummy data on error
        setCourses(dummyCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Premium Courses",
      description: "Access thousands of high-quality courses from industry experts"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Instructors",
      description: "Learn from certified professionals with real-world experience"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certificates",
      description: "Earn recognized certificates upon successful course completion"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=6366f1&color=fff&size=128",
      content: "UpSkillHub transformed my career. The courses are incredibly detailed and practical.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      image: "https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6&color=fff&size=128",
      content: "The AI-generated courses are amazing. They adapt perfectly to my learning style.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      image: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff&size=128",
      content: "Best investment I've made in my professional development. Highly recommended!",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Students" },
    { number: "1K+", label: "Courses" },
    { number: "500+", label: "Instructors" },
    { number: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg particles-bg py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute top-20 left-4 sm:left-10 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="pointer-events-none absolute top-40 right-4 sm:right-10 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-luxury-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="pointer-events-none absolute -bottom-8 left-10 sm:left-20 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-primary-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Empowering Your Learning Journey</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-display font-bold text-dark-900 leading-tight">
                  Master New Skills with 
                  <span className="animated-gradient-text block">Premium Education</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of learners in their journey to excellence. Access world-class courses, 
                  learn from industry experts, and advance your career with our AI-enhanced platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-luxury inline-flex items-center justify-center animate-glow group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/courses" className="btn-secondary inline-flex items-center justify-center group hover-lift">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Explore Courses
                </Link>
              </div>

              <div className="flex items-center space-x-8">
                <div className="hidden sm:flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Join 50,000+ students already learning</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-luxury-lg p-8 modern-card hover-lift">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300 aspect-video max-h-[400px]">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/Demo Video.mp4" type="video/mp4" />
                    {/* Fallback image if video doesn't load */}
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                      alt="Students learning" 
                      className="rounded-2xl w-full h-full object-cover"
                    />
                  </video>
                </div>
                <div className="absolute -top-4 -right-4 bg-luxury-500 text-white p-4 rounded-2xl shadow-lg animate-float">
                  <Award className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-primary-500 text-white p-4 rounded-2xl shadow-lg animate-float" style={{animationDelay: '1s'}}>
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">{stat.number}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-dark-900 mb-4">
              Why Choose UpSkillHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of online learning with our cutting-edge platform 
              designed for modern learners and educators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg modern-card hover-lift gradient-border"
              >
                <div className="bg-gradient-to-br from-primary-100 to-luxury-100 w-16 h-16 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-dark-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-dark-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Explore our most popular courses and start learning today
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden modern-card hover-lift group"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-600 shadow-lg">
                      ₹{course.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-sm font-semibold text-gray-700">{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-dark-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">By {course.instructor.name}</span>
                      <Link 
                        to={`/courses/${course._id}`}
                        className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center group/link"
                      >
                        View Course
                        <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              to="/courses" 
              className="btn-luxury inline-flex items-center"
            >
              View All Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-4xl font-display font-bold text-dark-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our successful learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-luxury modern-card hover-lift"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-dark-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-primary-600 to-luxury-600 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-white rounded-full filter blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of successful learners and take your skills to the next level 
              with our premium courses and AI-powered learning experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-colors duration-200 inline-flex items-center justify-center"
              >
                Start Learning Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="/courses" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-xl transition-colors duration-200 inline-flex items-center justify-center"
              >
                Browse Courses
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
