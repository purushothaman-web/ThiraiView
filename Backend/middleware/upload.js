// middleware/upload.js
const { uploadMoviePoster } = require('../config/cloudinary');

// Export the Cloudinary upload middleware for movie posters
module.exports = uploadMoviePoster;
