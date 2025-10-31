const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required']
  },
  type: {
    type: String,
    enum: ['pdf', 'link', 'file'],
    required: [true, 'Resource type is required']
  },
  size: {
    type: Number,
    default: 0
  }
}, { _id: false });

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    maxlength: [200, 'Lecture title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Lecture description is required']
  },
  video: {
    url: {
      type: String,
      required: [true, 'Video URL is required']
    },
    public_id: {
      type: String,
      required: [true, 'Video public_id is required']
    },
    duration: {
      type: Number, // in seconds
      default: 0
    },
    format: {
      type: String,
      default: 'mp4'
    },
    thumbnail: {
      type: String,
      default: ''
    }
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  resources: [resourceSchema],
  isPreview: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
lectureSchema.index({ course: 1, order: 1 });

// Update the updatedAt field before saving
lectureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get lectures by course ID
lectureSchema.statics.getLecturesByCourse = async function(courseId) {
  return this.find({ course: courseId })
    .sort('order')
    .populate('instructor', 'name email');
};

// Instance method to get formatted duration
lectureSchema.methods.getFormattedDuration = function() {
  const hours = Math.floor(this.video.duration / 3600);
  const minutes = Math.floor((this.video.duration % 3600) / 60);
  const seconds = this.video.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

module.exports = mongoose.model('Lecture', lectureSchema);
