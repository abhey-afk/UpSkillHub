const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'instructor1@example.com',
    password: 'password123',
    role: 'instructor',
    bio: 'Experienced web developer with 10+ years in the industry',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    avatar: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'instructor2@example.com',
    password: 'password123',
    role: 'instructor',
    bio: 'UI/UX Designer and Frontend Developer',
    skills: ['Design', 'Figma', 'CSS', 'React'],
    avatar: {
      url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'instructor3@example.com',
    password: 'password123',
    role: 'instructor',
    bio: 'Data Scientist and Machine Learning Expert',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow'],
    avatar: {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  }
];

const sampleCourses = [
  {
    title: 'Complete React.js Development Course',
    description: 'Master React.js from basics to advanced concepts. Learn hooks, context, routing, and state management. Build real-world projects and deploy them to production.',
    shortDescription: 'Learn React.js from scratch and build amazing web applications',
    category: 'Programming',
    subcategory: 'Web Development',
    level: 'Intermediate',
    price: 89.99,
    discountPrice: 59.99,
    discountPercentage: 33,
    whatYouWillLearn: [
      'Build modern React applications',
      'Understand React hooks and context',
      'Implement routing with React Router',
      'State management with Redux',
      'Deploy React apps to production'
    ],
    requirements: [
      'Basic knowledge of HTML, CSS, and JavaScript',
      'Understanding of ES6+ features',
      'A computer with internet connection'
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop'
    },
    lessons: [
      {
        title: 'Introduction to React',
        description: 'Learn what React is and why it\'s popular',
        duration: 45,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 1
      },
      {
        title: 'Setting up Development Environment',
        description: 'Install Node.js, npm, and create your first React app',
        duration: 30,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 2
      },
      {
        title: 'JSX and Components',
        description: 'Understanding JSX syntax and creating components',
        duration: 60,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 3
      },
      {
        title: 'Props and State',
        description: 'Learn how to pass data and manage component state',
        duration: 75,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 4
      },
      {
        title: 'React Hooks',
        description: 'Master useState, useEffect, and custom hooks',
        duration: 90,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 5
      }
    ],
    tags: ['react', 'javascript', 'frontend', 'web development'],
    isPublished: true,
    isFeatured: true,
    totalEnrollments: 1250,
    averageRating: 4.7,
    totalRatings: 340
  },
  {
    title: 'UI/UX Design Masterclass',
    description: 'Complete guide to UI/UX design principles, tools, and workflows. Learn Figma, design systems, user research, and prototyping.',
    shortDescription: 'Master UI/UX design from beginner to professional level',
    category: 'Design',
    subcategory: 'UI/UX Design',
    level: 'Beginner',
    price: 79.99,
    whatYouWillLearn: [
      'Design principles and theory',
      'User research and personas',
      'Wireframing and prototyping',
      'Figma mastery',
      'Design systems creation'
    ],
    requirements: [
      'No prior design experience needed',
      'Computer with internet access',
      'Willingness to learn and practice'
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'
    },
    lessons: [
      {
        title: 'Design Fundamentals',
        description: 'Color theory, typography, and layout principles',
        duration: 50,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 1
      },
      {
        title: 'User Research Methods',
        description: 'Learn how to understand your users',
        duration: 40,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 2
      },
      {
        title: 'Figma Basics',
        description: 'Getting started with Figma interface and tools',
        duration: 35,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 3
      },
      {
        title: 'Wireframing Techniques',
        description: 'Create effective wireframes for web and mobile',
        duration: 55,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 4
      }
    ],
    tags: ['design', 'ui', 'ux', 'figma'],
    isPublished: true,
    isFeatured: true,
    totalEnrollments: 890,
    averageRating: 4.5,
    totalRatings: 220
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming for data analysis, visualization, and machine learning. Work with pandas, numpy, matplotlib, and scikit-learn.',
    shortDescription: 'Master Python for data science and machine learning',
    category: 'Data Science',
    subcategory: 'Python Programming',
    level: 'Intermediate',
    price: 99.99,
    discountPrice: 69.99,
    discountPercentage: 30,
    whatYouWillLearn: [
      'Python programming fundamentals',
      'Data manipulation with pandas',
      'Data visualization with matplotlib',
      'Machine learning basics',
      'Real-world data projects'
    ],
    requirements: [
      'Basic programming knowledge helpful',
      'High school level mathematics',
      'Computer with Python installed'
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
    },
    lessons: [
      {
        title: 'Python Basics for Data Science',
        description: 'Variables, data types, and control structures',
        duration: 60,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 1
      },
      {
        title: 'Working with NumPy',
        description: 'Numerical computing with NumPy arrays',
        duration: 45,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 2
      },
      {
        title: 'Data Analysis with Pandas',
        description: 'DataFrames, data cleaning, and manipulation',
        duration: 80,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 3
      },
      {
        title: 'Data Visualization',
        description: 'Creating charts and graphs with matplotlib',
        duration: 70,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 4
      }
    ],
    tags: ['python', 'data science', 'machine learning', 'pandas'],
    isPublished: true,
    totalEnrollments: 567,
    averageRating: 4.6,
    totalRatings: 150
  },
  {
    title: 'Digital Marketing Fundamentals',
    description: 'Complete guide to digital marketing including SEO, social media marketing, email marketing, and Google Ads.',
    shortDescription: 'Learn digital marketing strategies that actually work',
    category: 'Marketing',
    subcategory: 'Digital Marketing',
    level: 'Beginner',
    price: 69.99,
    whatYouWillLearn: [
      'SEO optimization techniques',
      'Social media marketing strategies',
      'Email marketing campaigns',
      'Google Ads and PPC',
      'Analytics and reporting'
    ],
    requirements: [
      'No prior marketing experience needed',
      'Basic computer skills',
      'Access to social media platforms'
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    },
    lessons: [
      {
        title: 'Digital Marketing Overview',
        description: 'Understanding the digital marketing landscape',
        duration: 30,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 1
      },
      {
        title: 'SEO Fundamentals',
        description: 'On-page and off-page SEO techniques',
        duration: 55,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 2
      },
      {
        title: 'Social Media Strategy',
        description: 'Creating effective social media campaigns',
        duration: 45,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 3
      },
      {
        title: 'Email Marketing',
        description: 'Building and nurturing email lists',
        duration: 40,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 4
      }
    ],
    tags: ['marketing', 'seo', 'social media', 'digital'],
    isPublished: true,
    totalEnrollments: 423,
    averageRating: 4.3,
    totalRatings: 89
  },
  {
    title: 'Photography Masterclass',
    description: 'Learn professional photography techniques, composition, lighting, and post-processing. Suitable for beginners and intermediate photographers.',
    shortDescription: 'Master photography from basics to advanced techniques',
    category: 'Photography',
    subcategory: 'Digital Photography',
    level: 'Beginner',
    price: 59.99,
    whatYouWillLearn: [
      'Camera settings and controls',
      'Composition techniques',
      'Lighting fundamentals',
      'Photo editing with Lightroom',
      'Building a photography portfolio'
    ],
    requirements: [
      'A camera (DSLR, mirrorless, or smartphone)',
      'No prior photography experience needed',
      'Computer for editing (optional)'
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop'
    },
    lessons: [
      {
        title: 'Camera Basics',
        description: 'Understanding your camera and basic settings',
        duration: 40,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 1
      },
      {
        title: 'Composition Rules',
        description: 'Rule of thirds, leading lines, and framing',
        duration: 35,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 2
      },
      {
        title: 'Natural Light Photography',
        description: 'Working with available light',
        duration: 50,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 3
      },
      {
        title: 'Portrait Photography',
        description: 'Taking great photos of people',
        duration: 45,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 4
      }
    ],
    tags: ['photography', 'camera', 'composition', 'lightroom'],
    isPublished: true,
    totalEnrollments: 678,
    averageRating: 4.4,
    totalRatings: 156
  },
  {
    title: 'Business Strategy and Planning',
    description: 'Learn how to create effective business strategies, conduct market analysis, and develop comprehensive business plans.',
    shortDescription: 'Master business strategy and planning fundamentals',
    category: 'Business',
    subcategory: 'Strategy',
    level: 'Intermediate',
    price: 89.99,
    discountPrice: 64.99,
    discountPercentage: 28,
    whatYouWillLearn: [
      'Strategic planning frameworks',
      'Market analysis techniques',
      'Competitive analysis',
      'Financial planning basics',
      'Business model development'
    ],
    requirements: [
      'Basic business knowledge helpful',
      'Interest in entrepreneurship',
      'Calculator or spreadsheet software'
    ],
    thumbnail: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
    },
    lessons: [
      {
        title: 'Introduction to Business Strategy',
        description: 'What is strategy and why it matters',
        duration: 35,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 1
      },
      {
        title: 'Market Analysis',
        description: 'Understanding your market and customers',
        duration: 50,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 2
      },
      {
        title: 'Competitive Analysis',
        description: 'Analyzing competitors and positioning',
        duration: 45,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 3
      },
      {
        title: 'Business Model Canvas',
        description: 'Creating and validating business models',
        duration: 60,
        videoUrl: 'https://www.youtube.com/watch?v=dGcsHMXbSOA',
        order: 4
      }
    ],
    tags: ['business', 'strategy', 'planning', 'entrepreneurship'],
    isPublished: true,
    totalEnrollments: 234,
    averageRating: 4.2,
    totalRatings: 67
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});

    // Create users
    console.log('Creating sample users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create courses and assign to instructors
    console.log('Creating sample courses...');
    const coursesWithInstructors = sampleCourses.map((course, index) => {
      const instructorIndex = index % createdUsers.length;
      return {
        ...course,
        instructor: createdUsers[instructorIndex]._id,
        totalDuration: course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
        totalLessons: course.lessons.length
      };
    });

    const createdCourses = await Course.insertMany(coursesWithInstructors);
    console.log(`Created ${createdCourses.length} courses`);

    // Update users with their created courses
    for (let i = 0; i < createdCourses.length; i++) {
      const course = createdCourses[i];
      await User.findByIdAndUpdate(
        course.instructor,
        { $push: { createdCourses: course._id } }
      );
    }

    console.log('DONE Database seeded successfully!');
    console.log('Sample courses created:');
    createdCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - $${course.price}`);
    });

    console.log('\nSample instructor accounts:');
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - password: password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
