// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = process.env.MOVIE_UPLOADS_DIR || 'uploads/movies';

// Create uploads directory if it doesn't exist
const localPath = path.join(__dirname, `../${UPLOADS_DIR}`);
if (!fs.existsSync(localPath)) {
  fs.mkdirSync(localPath, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/webp', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .webp, .jpeg, and .png files are allowed'));
  }
};

// Upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
