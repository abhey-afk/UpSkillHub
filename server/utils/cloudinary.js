const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Promisify the upload and destroy methods
const uploadFile = promisify(cloudinary.uploader.upload);
const destroyFile = promisify(cloudinary.uploader.destroy);

/**
 * Upload a file to Cloudinary
 * @param {String} filePath - Path to the file or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await uploadFile(filePath, {
      resource_type: 'auto', // Automatically detect if it's an image or video
      folder: 'upskillhub',
      use_filename: true,
      unique_filename: true,
      ...options
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      duration: result.duration
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Public ID of the file to delete
 * @param {Object} options - Delete options
 * @returns {Promise<Object>} Delete result
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    return await destroyFile(publicId, {
      resource_type: 'auto',
      ...options
    });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
