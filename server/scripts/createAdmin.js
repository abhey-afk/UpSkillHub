const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for creating admin');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@edulux.com';
    const adminPassword = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('ERROR Admin user already exists with email:', adminEmail);
      process.exit(0);
    }

    // Create admin user (password will be automatically hashed by the User model)
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: adminPassword, // Don't hash manually - let the model do it
      role: 'admin',
      isEmailVerified: true,
      bio: 'System Administrator',
      avatar: {
        url: 'https://ui-avatars.com/api/?name=Admin+User&background=DC2626&color=fff&size=128'
      }
    });

    console.log('DONE Admin user created successfully!');
    console.log('EMAIL Email:', admin.email);
    console.log('KEY Password:', adminPassword);
    console.log('USER Role:', admin.role);
    console.log('DATE Created:', admin.createdAt.toLocaleDateString());

    console.log('\nLAUNCH You can now login as admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\nTIP Access admin panel at: /admin/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('ERROR Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the creation
createAdmin();
