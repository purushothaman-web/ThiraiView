// middleware/uploadProfile.js
const { uploadProfilePicture } = require('../config/cloudinary');

// Export the Cloudinary upload middleware for profile pictures
module.exports = uploadProfilePicture;
