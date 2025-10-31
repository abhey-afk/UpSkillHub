const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for clearing courses');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Clear courses function
const clearCourses = async () => {
  try {
    await connectDB();

    console.log('DELETE  Clearing all courses...');
    
    // Delete all courses
    const deletedCourses = await Course.deleteMany({});
    console.log(`DONE Deleted ${deletedCourses.deletedCount} courses`);

    // Clear createdCourses array from all users
    const updatedUsers = await User.updateMany(
      {},
      { $set: { createdCourses: [] } }
    );
    console.log(`DONE Cleared createdCourses from ${updatedUsers.modifiedCount} users`);

    // Clear enrolledCourses array from all users
    const updatedEnrollments = await User.updateMany(
      {},
      { $set: { enrolledCourses: [] } }
    );
    console.log(`DONE Cleared enrolledCourses from ${updatedEnrollments.modifiedCount} users`);

    console.log('\nSUCCESS All courses have been successfully deleted!');
    console.log('TIP Instructor accounts are still available:');
    
    const instructors = await User.find({ role: 'instructor' }).select('email');
    instructors.forEach((instructor, index) => {
      console.log(`${index + 1}. ${instructor.email} - password: password123`);
    });

    console.log('\nLAUNCH You can now use the AI course generation feature to create new courses!');
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR Error clearing courses:', error);
    process.exit(1);
  }
};

// Run the clear function
clearCourses();
