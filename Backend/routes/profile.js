// 📁 routes/profile.js

const express = require("express");
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const authenticate = require("../middleware/auth"); // JWT middleware
// Optional auth middleware for public routes
const optionalAuth = require("../middleware/auth").optional;
const upload = require("../middleware/uploadProfile"); // multer config
const { deleteImage, getFullUrl, USE_CLOUDINARY } = require('../config/cloudinary');

// GET /profile - Own Profile
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
        followersCount: 0,
        followingCount: 0,
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
        _count: {
          select: {
            followers: true,
            following: true,
            watchlists: true
          }
        }
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Flatten _count
    const { _count, ...userData } = user;

    res.json({
      ...userData,
      watchlistCount: _count.watchlists,
      followersCount: _count.followers,
      followingCount: _count.following
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /profile/movies - Own Movies
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

// GET /profile/watchlist - Own Watchlist
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

// GET /profile/reviews - Own Reviews
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

// PUT /profile - Update Own Profile
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

    // Handle File Upload
    if (req.file) {
      // Delete old profile picture if it was a local file or cloudinary id
      if (profilePicturePath) {
        try {
          await deleteImage(profilePicturePath);
        } catch (deleteError) {
          console.error('Error deleting old profile picture:', deleteError);
        }
      }
      profilePicturePath = USE_CLOUDINARY ? req.file.path : `/${process.env.PROFILE_UPLOADS_DIR || 'uploads/profiles'}/${req.file.filename}`;
    }
    // Handle URL Update (Avatar Selection)
    else if (req.body.profilePicture && typeof req.body.profilePicture === 'string') {
      // If user is switching from an uploaded file to an avatar URL, we should try to delete the old file
      if (profilePicturePath && !profilePicturePath.startsWith('http') && !profilePicturePath.startsWith('https://api.dicebear.com')) {
        try {
          await deleteImage(profilePicturePath);
        } catch (e) {
          console.error("Error cleaning up old profile picture:", e);
        }
      }
      profilePicturePath = req.body.profilePicture;
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


// --- Public Profile Routes ---

// GET /profile/:id - Public Profile Info
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        profilePicture: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            watchlists: true,
            reviews: true,
            movies: true
          }
        }
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let isFollowing = false;
    if (viewerId) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: user.id
          }
        }
      });
      isFollowing = !!follow;
    }

    // Flatten _count
    const { _count, ...userData } = user;

    res.json({
      ...userData,
      followersCount: _count.followers,
      followingCount: _count.following,
      reviewsCount: _count.reviews,
      moviesCount: _count.movies,
      watchlistCount: _count.watchlists,
      isFollowing
    });

  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /profile/:id/reviews - Public Reviews
router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { userId: parseInt(id) },
      include: {
        movie: { select: { id: true, title: true, poster: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /profile/:id/movies - Public Movies (Added by user)
router.get("/:id/movies", async (req, res) => {
  try {
    const { id } = req.params;
    const movies = await prisma.movie.findMany({
      where: { userId: parseInt(id) },
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

// GET /profile/:id/watchlist - Public Watchlist
router.get("/:id/watchlist", async (req, res) => {
  try {
    const { id } = req.params;
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: parseInt(id) },
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

module.exports = router;