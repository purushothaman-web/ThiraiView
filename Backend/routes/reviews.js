const { PrismaClient } = require('../generated/prisma');
const express = require('express');
const authMiddleware = require('../middleware/auth'); 

const prisma = new PrismaClient();
const review = express.Router();

// POST /movies/:id/reviews
review.post('/movies/:id/reviews', authMiddleware, async (req, res) => {
  const movieId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  let { content, rating } = req.body;

  if (isNaN(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required and must be a string.' });
  }

  content = content.trim();
  if (!content) {
    return res.status(400).json({ error: 'Content cannot be empty.' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found.' });
    }

    const existingReview = await prisma.review.findFirst({
      where: { movieId, userId },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this movie' });
    }

    const review = await prisma.review.create({
      data: {
        content,
        rating,
        movie: { connect: { id: movieId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /movies/:id/reviews
review.get('/movies/:id/reviews', authMiddleware.optional, async (req, res) => {
  const movieId = parseInt(req.params.id, 10);
  const userId = req.user?.id;

  if (isNaN(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const reviews = await prisma.review.findMany({
      where: { movieId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { reviewLikes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Extract review IDs
    const reviewIds = reviews.map(r => r.id);

    // Fetch likes if userId exists, otherwise empty array
    const likes = userId
      ? await prisma.reviewLike.findMany({
          where: {
            userId,
            reviewId: { in: reviewIds },
          },
        })
      : [];

    // Map over reviews and mark if liked by current user
    const enrichedReviews = reviews.map(review => {
      const likedByUser = likes.some(like => like.reviewId === review.id);

      return {
        id: review.id,
        content: review.content,
        rating: review.rating,
        createdAt: review.createdAt,
        user: review.user,
        likesCount: review._count.reviewLikes,
        likedByUser,
      };
    });

    return res.json(enrichedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT /reviews/:id
review.put('/:id', authMiddleware, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  let { content, rating } = req.body;

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }
  content = content.trim();

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only modify your own reviews' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { content, rating },
    });

    return res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /reviews/:id
review.delete('/:id', authMiddleware, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Import Prisma and authMiddleware already done above

// POST /reviews/:id/like → Like a review
review.post('/:id/like', authMiddleware, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    // Check review exists
    const reviewExists = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!reviewExists) return res.status(404).json({ error: 'Review not found' });

    // Create like (unique constraint prevents duplicates)
    const like = await prisma.reviewLike.create({
      data: { reviewId, userId },
    });

    res.json({ message: 'Review liked', like });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint failed
      return res.status(400).json({ error: 'You have already liked this review' });
    }
    console.error('Error liking review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /reviews/:id/unlike → Unlike a review
review.delete('/:id/unlike', authMiddleware, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    // Find the like
    const like = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: { userId, reviewId },
      },
    });

    if (!like) return res.status(404).json({ error: 'Like not found' });

    // Delete like
    await prisma.reviewLike.delete({ where: { id: like.id } });

    res.json({ message: 'Review unliked' });
  } catch (error) {
    console.error('Error unliking review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reviews/:id/likes → Get count of likes for a review
review.get('/:id/likes', async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    const likesCount = await prisma.reviewLike.count({ where: { reviewId } });
    res.json({ likesCount });
  } catch (error) {
    console.error('Error fetching likes count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optional: GET /reviews/:id/liked → Check if current user liked a review (requires auth)
// Useful for frontend to highlight the liked button
review.get('/:id/liked', authMiddleware, async (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  try {
    const like = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: { userId, reviewId },
      },
    });

    res.json({ liked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = review;