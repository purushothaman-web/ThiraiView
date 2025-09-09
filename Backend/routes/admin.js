
const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Block a user (superuser only)
router.patch('/users/:userId/block', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only superuser (ADMIN role) can block users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only superuser can block users' });
    }
    
    // Can't block yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot block your own account' });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { blocked: true },
      select: { id: true, username: true, email: true, blocked: true, role: true }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unblock a user (superuser only)
router.patch('/users/:userId/unblock', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only superuser (ADMIN role) can unblock users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only superuser can unblock users' });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { blocked: false },
      select: { id: true, username: true, email: true, blocked: true, role: true }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Admin middleware - check if user is admin or moderator
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply authentication and then admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalReviews,
      totalComments,
      recentUsers,
      recentMovies,
      flaggedContent
    ] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.review.count(),
      prisma.comment.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          role: true
        }
      }),
      prisma.movie.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      }),
      // This would need a flagging system - for now return empty
      []
    ]);

    res.json({
      stats: {
        totalUsers,
        totalMovies,
        totalReviews,
        totalComments,
        flaggedContent: flaggedContent.length
      },
      recent: {
        users: recentUsers,
        movies: recentMovies
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role })
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            movies: true,
            reviews: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Only superuser (ADMIN role) can promote to admin or moderator
    if ((role === 'ADMIN' || role === 'MODERATOR') && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only superuser can promote to admin or moderator' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Can't delete yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all movies with pagination
router.get('/movies', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { director: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const movies = await prisma.movie.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        _count: {
          select: {
            reviews: true,
            watchlists: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.movie.count({ where });

    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete movie
router.delete('/movies/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    await prisma.movie.delete({
      where: { id: parseInt(movieId) }
    });

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews with pagination
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(search && {
        content: { contains: search, mode: 'insensitive' }
      })
    };

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        movie: {
          select: {
            id: true,
            title: true
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
      skip,
      take
    });

    const total = await prisma.review.count({ where });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete review
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all comments with pagination
router.get('/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      ...(search && {
        content: { contains: search, mode: 'insensitive' }
      })
    };

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        review: {
          select: {
            id: true,
            content: true,
            movie: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.comment.count({ where });

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
