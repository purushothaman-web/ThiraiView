const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if we should use Cloudinary (production) or local storage (development)
const USE_CLOUDINARY = process.env.NODE_ENV === 'production' && 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary only if in production and credentials are available
if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Local storage configuration
const MOVIE_UPLOADS_DIR = process.env.MOVIE_UPLOADS_DIR || 'uploads/movies';
const PROFILE_UPLOADS_DIR = process.env.PROFILE_UPLOADS_DIR || 'uploads/profiles';
const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || 'http://localhost:3000';

// Create local uploads directories if they don't exist
const movieUploadsPath = path.join(__dirname, `../${MOVIE_UPLOADS_DIR}`);
const profileUploadsPath = path.join(__dirname, `../${PROFILE_UPLOADS_DIR}`);

if (!fs.existsSync(movieUploadsPath)) {
  fs.mkdirSync(movieUploadsPath, { recursive: true });
}
if (!fs.existsSync(profileUploadsPath)) {
  fs.mkdirSync(profileUploadsPath, { recursive: true });
}

// Local storage for movie posters
const moviePosterLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, movieUploadsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const movieId = req.params.id || 'temp';
    cb(null, `${movieId}-${Date.now()}${ext}`);
  },
});

// Local storage for profile pictures
const profilePictureLocalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || 'temp';
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

// Cloudinary storage for movie posters (production only)
const moviePosterCloudinaryStorage = USE_CLOUDINARY ? new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thiraiview/movies',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 750, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const movieId = req.params.id || 'temp';
      return `movie-${movieId}-${timestamp}`;
    }
  }
}) : null;

// Cloudinary storage for profile pictures (production only)
const profilePictureCloudinaryStorage = USE_CLOUDINARY ? new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'thiraiview/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?.id || 'temp';
      return `profile-${userId}-${timestamp}`;
    }
  }
}) : null;

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create multer upload middleware for movie posters
const uploadMoviePoster = multer({
  storage: USE_CLOUDINARY ? moviePosterCloudinaryStorage : moviePosterLocalStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter
});

// Create multer upload middleware for profile pictures
const uploadProfilePicture = multer({
  storage: USE_CLOUDINARY ? profilePictureCloudinaryStorage : profilePictureLocalStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter
});

// Utility function to delete image (Cloudinary or local)
const deleteImage = async (url) => {
  if (!url) return null;
  
  if (USE_CLOUDINARY && url.includes('cloudinary.com')) {
    // Delete from Cloudinary
    const publicId = extractPublicId(url);
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
      }
    }
  } else {
    // Delete local file
    try {
      const filePath = path.join(__dirname, '..', url.replace(ASSETS_BASE_URL, '').replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
      throw error;
    }
  }
};

// Utility function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Extract public ID from Cloudinary URL
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
  const match = url.match(/\/upload\/.*\/(.+)$/);
  return match ? match[1].replace(/\.[^/.]+$/, '') : null;
};

// Utility function to get full URL for local files
const getFullUrl = (relativePath) => {
  if (!relativePath) return null;
  
  // If it's already a full URL (Cloudinary), return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // For local files, add the base URL
  return `${ASSETS_BASE_URL}${relativePath}`;
};

module.exports = {
  cloudinary,
  uploadMoviePoster,
  uploadProfilePicture,
  deleteImage,
  extractPublicId,
  getFullUrl,
  USE_CLOUDINARY,
  ASSETS_BASE_URL
};
