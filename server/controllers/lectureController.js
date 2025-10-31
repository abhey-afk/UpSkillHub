const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const path = require('path');

// @desc    Upload lecture video
// @route   POST /api/v1/courses/:courseId/lectures
// @access  Private (Instructor)
exports.uploadLecture = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  // Check if course exists
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Make sure user is course instructor
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add lectures to this course`,
        401
      )
    );
  }

  // Check if video file exists
  if (!req.files || !req.files.video) {
    return next(new ErrorResponse('Please upload a video file', 400));
  }

  const videoFile = req.files.video;
  
  // Check file type
  const fileExt = path.extname(videoFile.name).toLowerCase();
  if (!['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(fileExt)) {
    return next(new ErrorResponse('Please upload a video file (MP4, MOV, AVI, MKV, WEBM)', 400));
  }

  // Check file size (max 2GB)
  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
  if (videoFile.size > maxSize) {
    return next(new ErrorResponse('Video size cannot be larger than 2GB', 400));
  }
  
  try {
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(videoFile.tempFilePath || videoFile.path, {
      resource_type: 'video',
      folder: `upskillhub/courses/${course._id}/lectures`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });

    // Create lecture
    const lecture = await Lecture.create({
      title: req.body.title || 'Untitled Lecture',
      description: req.body.description || '',
      video: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        duration: uploadResult.duration || 0,
        format: uploadResult.format
      },
      course: course._id,
      instructor: req.user.id,
      order: req.body.order || 1,
      isPreview: req.body.isPreview || false
    });

    // Update course status to pending if it was a draft
    if (course.status === 'draft') {
      course.status = 'pending';
      await course.save();
    }

    res.status(201).json({
      success: true,
      data: lecture
    });
  } catch (err) {
    return next(new ErrorResponse(`Error uploading video: ${err.message}`, 500));
  }
});

// @desc    Get all lectures for a course
// @route   GET /api/v1/courses/:courseId/lectures
// @access  Private (Enrolled students, Instructor, Admin)
exports.getLectures = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if user is enrolled, instructor, or admin
  const isEnrolled = course.students.some(
    student => student.user.toString() === req.user.id
  );
  
  const isInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isEnrolled && !isInstructor && !isAdmin) {
    return next(
      new ErrorResponse(
        'Not authorized to access these lectures',
        401
      )
    );
  }

  const lectures = await Lecture.find({ course: course._id })
    .sort('order')
    .populate('instructor', 'name email');

  res.status(200).json({
    success: true,
    count: lectures.length,
    data: lectures
  });
});

// @desc    Delete a lecture
// @route   DELETE /api/v1/lectures/:id
// @access  Private (Instructor, Admin)
exports.deleteLecture = asyncHandler(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return next(new ErrorResponse(`Lecture not found with id of ${req.params.id}`, 404));
  }

  // Check if user is instructor or admin
  if (lecture.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this lecture`,
        401
      )
    );
  }

  // Delete video from Cloudinary
  try {
    if (lecture.video && lecture.video.public_id) {
      await deleteFromCloudinary(lecture.video.public_id, {
        resource_type: 'video'
      });
    }
  } catch (err) {
    console.error('Error deleting video from Cloudinary:', err);
    // Continue with deletion even if Cloudinary delete fails
  }

  await lecture.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update lecture
// @route   PUT /api/v1/lectures/:id
// @access  Private (Instructor, Admin)
exports.updateLecture = asyncHandler(async (req, res, next) => {
  let lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    return next(new ErrorResponse(`Lecture not found with id of ${req.params.id}`, 404));
  }

  // Check if user is instructor or admin
  if (lecture.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this lecture`,
        401
      )
    );
  }

  // Update fields
  const { title, description, order, isPreview } = req.body;
  
  if (title) lecture.title = title;
  if (description) lecture.description = description;
  if (order) lecture.order = order;
  if (isPreview !== undefined) lecture.isPreview = isPreview;

  // Handle video update if new video is provided
  if (req.files && req.files.video) {
    const videoFile = req.files.video;
    
    // Delete old video from Cloudinary
    try {
      if (lecture.video && lecture.video.public_id) {
        await deleteFromCloudinary(lecture.video.public_id, {
          resource_type: 'video'
        });
      }
    } catch (err) {
      console.error('Error deleting old video from Cloudinary:', err);
    }

    // Upload new video to Cloudinary
    const uploadResult = await uploadToCloudinary(videoFile.tempFilePath || videoFile.path, {
      resource_type: 'video',
      folder: `upskillhub/courses/${lecture.course}/lectures`,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });

    // Update lecture video details
    lecture.video = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      duration: uploadResult.duration || lecture.video.duration,
      format: uploadResult.format
    };
  }

  await lecture.save();

  res.status(200).json({
    success: true,
    data: lecture
  });
});
