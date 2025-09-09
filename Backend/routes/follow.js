const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Follow a user
router.post('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Can't follow yourself
    if (parseInt(userId) === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, username: true, name: true }
    });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId)
        }
      }
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    await prisma.userFollow.create({
      data: {
        followerId,
        followingId: parseInt(userId)
      }
    });

    // Create notification for the user being followed
    await prisma.notification.create({
      data: {
        type: 'FOLLOW',
        message: `${req.user.username || req.user.name} started following you`,
        userId: parseInt(userId),
        actorId: followerId
      }
    });

    res.json({ 
      message: 'Successfully followed user',
      following: userToFollow
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow a user
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId)
        }
      }
    });

    if (!follow) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId)
        }
      }
    });

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get followers of a user
router.get('/:userId/followers', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const followers = await prisma.userFollow.findMany({
      where: { followingId: parseInt(userId) },
      skip,
      take,
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.userFollow.count({
      where: { followingId: parseInt(userId) }
    });

    res.json({
      followers: followers.map(f => f.follower),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users that a user is following
router.get('/:userId/following', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const following = await prisma.userFollow.findMany({
      where: { followerId: parseInt(userId) },
      skip,
      take,
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.userFollow.count({
      where: { followerId: parseInt(userId) }
    });

    res.json({
      following: following.map(f => f.following),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if current user follows a specific user
router.get('/:userId/status', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: parseInt(userId)
        }
      }
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user feed (movies and reviews from followed users)
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get users that current user follows
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return res.json({
        feed: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    // Get recent movies added by followed users
    const recentMovies = await prisma.movie.findMany({
      where: {
        userId: { in: followingIds }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(take / 2) // Half for movies
    });

    // Get recent reviews by followed users
    const recentReviews = await prisma.review.findMany({
      where: {
        userId: { in: followingIds }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true
          }
        },
        movie: {
          select: {
            id: true,
            title: true,
            poster: true
          }
        },
        _count: {
          select: {
            reviewLikes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.ceil(take / 2) // Half for reviews
    });

    // Combine and sort by creation date
    const feed = [
      ...recentMovies.map(movie => ({
        type: 'movie',
        data: movie,
        createdAt: movie.createdAt
      })),
      ...recentReviews.map(review => ({
        type: 'review',
        data: review,
        createdAt: review.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(skip, skip + take);

    res.json({
      feed,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: feed.length,
        pages: Math.ceil(feed.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;