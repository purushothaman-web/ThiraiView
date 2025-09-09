const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get comments for a review
router.get('/review/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get top-level comments (no parent)
    const comments = await prisma.comment.findMany({
      where: {
        reviewId: parseInt(reviewId),
        parentId: null
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
        replies: {
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
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.comment.count({
      where: {
        reviewId: parseInt(reviewId),
        parentId: null
      }
    });

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

// Create a comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, reviewId, parentId } = req.body;
    const userId = req.user.id;

    if (!content || !reviewId) {
      return res.status(400).json({ error: 'Content and reviewId are required' });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: { user: true }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) }
      });

      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        reviewId: parseInt(reviewId),
        parentId: parentId ? parseInt(parentId) : null
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
      }
    });

    // Create notification for review author (if not commenting on own review)
    if (review.userId !== userId) {
      await prisma.notification.create({
        data: {
          type: parentId ? 'COMMENT_REPLY' : 'COMMENT',
          message: parentId 
            ? `${req.user.username || req.user.name} replied to your comment`
            : `${req.user.username || req.user.name} commented on your review`,
          userId: review.userId,
          actorId: userId,
          reviewId: parseInt(reviewId),
          commentId: comment.id
        }
      });
    }

    // If it's a reply, also notify the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        include: { user: true }
      });

      if (parentComment && parentComment.userId !== userId && parentComment.userId !== review.userId) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT_REPLY',
            message: `${req.user.username || req.user.name} replied to your comment`,
            userId: parentComment.userId,
            actorId: userId,
            reviewId: parseInt(reviewId),
            commentId: comment.id
          }
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a comment
router.put('/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { content: content.trim() },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a comment
router.delete('/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete comment (replies will be deleted due to cascade)
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
