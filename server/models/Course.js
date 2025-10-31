const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Lesson description is required']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Lesson duration is required']
  },
  order: {
    type: Number,
    required: true
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'link', 'file']
    }
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  }
});

const courseSchema = new mongoose.Schema({
  // Image handling with Cloudinary
  image: {
    url: String,
    public_id: String,
    width: Number,
    height: Number,
    format: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Course must have an instructor']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Programming',
      'Design',
      'Business',
      'Marketing',
      'Data Science',
      'Photography',
      'Music',
      'Language',
      'Health & Fitness',
      'Personal Development'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Course subcategory is required']
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  language: {
    type: String,
    required: [true, 'Course language is required'],
    default: 'English'
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  thumbnail: {
    public_id: String,
    url: {
      type: String,
      required: [true, 'Course thumbnail is required']
    }
  },
  previewVideo: {
    public_id: String,
    url: String
  },
  lessons: [lessonSchema],
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    required: [true, 'Learning outcomes are required'],
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  totalEnrollments: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function() {
  return this.lessons.reduce((total, lesson) => total + lesson.duration, 0);
});

// Virtual for total lessons
courseSchema.virtual('totalLessons').get(function() {
  return this.lessons.length;
});

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for effective price
courseSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, subcategory: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ totalEnrollments: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ price: 1 });

// Update updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating before saving
courseSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
  next();
});

// Static method to get courses by category
courseSchema.statics.getCoursesByCategory = function(category) {
  return this.find({ category, isPublished: true, approvalStatus: 'approved' }).populate('instructor', 'firstName lastName avatar');
};

// Static method to get featured courses
courseSchema.statics.getFeaturedCourses = function() {
  return this.find({ isFeatured: true, isPublished: true, approvalStatus: 'approved' }).populate('instructor', 'firstName lastName avatar');
};

// Static method to get top-rated courses
courseSchema.statics.getTopRatedCourses = function(limit = 10) {
  return this.find({ isPublished: true, approvalStatus: 'approved' })
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(limit)
    .populate('instructor', 'firstName lastName avatar');
};

// Instance method to add rating
courseSchema.methods.addRating = function(userId, rating, review) {
  const existingRatingIndex = this.ratings.findIndex(r => r.user.toString() === userId.toString());
  
  if (existingRatingIndex > -1) {
    // Update existing rating
    this.ratings[existingRatingIndex].rating = rating;
    this.ratings[existingRatingIndex].review = review;
  } else {
    // Add new rating
    this.ratings.push({
      user: userId,
      rating,
      review
    });
  }
  
  return this.save();
};

// Instance method to enroll student
courseSchema.methods.enrollStudent = function(studentId) {
  const existingEnrollment = this.enrolledStudents.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
  
  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this course');
  }
  
  this.enrolledStudents.push({
    student: studentId
  });
  
  this.totalEnrollments += 1;
  this.totalRevenue += this.effectivePrice;
  
  return this.save();
};

// Add a pre-remove hook to delete associated files
courseSchema.pre('remove', async function(next) {
  try {
    // Delete course image if exists
    if (this.image && this.image.public_id) {
      const { deleteFromCloudinary } = require('../utils/cloudinary');
      await deleteFromCloudinary(this.image.public_id, {
        resource_type: 'image'
      });
    }
    
    // Delete all associated lectures
    const lectures = await this.model('Lecture').find({ course: this._id });
    for (const lecture of lectures) {
      if (lecture.video && lecture.video.public_id) {
        await deleteFromCloudinary(lecture.video.public_id, {
          resource_type: 'video'
        });
      }
      await lecture.remove();
    }
    
    next();
  } catch (error) {
    console.error('Error in course pre-remove hook:', error);
    next(error);
  }
});

module.exports = mongoose.model('Course', courseSchema);
