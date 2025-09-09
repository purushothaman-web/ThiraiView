// 📁 routes/profile.js

const express = require("express");
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const authenticate = require("../middleware/auth"); // JWT middleware
const upload = require("../middleware/uploadProfile"); // multer config
const { deleteImage, getFullUrl, USE_CLOUDINARY } = require('../config/cloudinary');

// GET /profile
router.get("/", authenticate, async (req, res) => {
  try {
    const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
    // If this is the default admin, return a static profile
    if (
      (req.user && req.user.isDefaultAdmin) ||
      (req.user && DEFAULT_ADMIN_EMAIL && req.user.email === DEFAULT_ADMIN_EMAIL)
    ) {
      return res.json({
        id: 0,
        email: DEFAULT_ADMIN_EMAIL,
        username: 'admin',
        name: 'Default Admin',
        bio: 'Superuser for ThiraiView',
        profilePicture: null,
        isVerified: true,
        watchlistCount: 0,
        role: 'ADMIN',
        isDefaultAdmin: true
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        profilePicture: true,
        isVerified: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const watchlistCount = await prisma.watchlist.count({
      where: { userId: req.user.id },
    });

    res.json({ ...user, watchlistCount });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /profile/movies
router.get("/movies", authenticate, async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        title: true,
        director: true,
        year: true,
        poster: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(movies);
  } catch (err) {
    console.error("Error fetching user movies:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /profile/watchlist
router.get("/watchlist", authenticate, async (req, res) => {
  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: {
        movie: {
          select: { id: true, title: true, year: true, director: true, poster: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(watchlist);
  } catch (err) {
    console.error("Error fetching watchlist:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /profile/reviews
router.get("/reviews", authenticate, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      include: {
        movie: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /profile
router.put("/", authenticate, upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, bio } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Check for duplicate username
    if (username && username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username },
      });

      if (existing && existing.id !== user.id) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    let profilePicturePath = user.profilePicture;

    // If new profile picture uploaded
    if (req.file) {
      // Delete old profile picture if exists
      if (profilePicturePath) {
        try {
          await deleteImage(profilePicturePath);
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Set new profile picture path
      profilePicturePath = USE_CLOUDINARY ? req.file.path : `/${process.env.PROFILE_UPLOADS_DIR || 'uploads/profiles'}/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username?.trim() || user.username,
        bio,
        profilePicture: profilePicturePath,
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        profilePicture: true,
        isVerified: true,
      },
    });

    res.json({ 
      user: {
        ...updatedUser,
        profilePicture: getFullUrl(updatedUser.profilePicture)
      }
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});



// GET /profile/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        profilePicture: true,
        isVerified: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;