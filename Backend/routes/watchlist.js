const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const authenticate = require('../middleware/auth');

// Add movie to watchlist
router.post('/', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.body;

  // Validate movieId presence and type
  if (!movieId || isNaN(parseInt(movieId, 10))) {
    return res.status(400).json({ error: 'Valid movieId is required' });
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id: parseInt(movieId, 10) } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const existing = await prisma.watchlist.findUnique({
      where: { userId_movieId: { userId, movieId: parseInt(movieId, 10) } },
    });

    if (existing) {
      return res.status(400).json({ error: 'Movie already in watchlist' });
    }

    const watchlistItem = await prisma.watchlist.create({
      data: { userId, movieId: parseInt(movieId, 10) },
    });

    res.status(201).json(watchlistItem);
  } catch (err) {
    console.error('Error adding to watchlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's watchlist with movie details
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(watchlist);
  } catch (err) {
    console.error('Error fetching watchlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove movie from watchlist by watchlist id
router.delete('/:id', authenticate, async (req, res) => {
  const watchlistId = parseInt(req.params.id, 10);
  const userId = req.user.id;

  if (isNaN(watchlistId)) {
    return res.status(400).json({ error: 'Invalid watchlist ID' });
  }

  try {
    const watchlistItem = await prisma.watchlist.findUnique({ where: { id: watchlistId } });

    if (!watchlistItem || watchlistItem.userId !== userId) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    await prisma.watchlist.delete({ where: { id: watchlistId } });

    // Optionally return the deleted item details here:
    // res.json(watchlistItem);

    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    console.error('Error removing from watchlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /watchlist/:id/watched — update watched status
router.patch('/:id/watched', authenticate, async (req, res) => {
  const watchlistId = parseInt(req.params.id, 10);
  const userId = req.user.id;
  const { watched } = req.body;

  if (isNaN(watchlistId)) {
    return res.status(400).json({ error: 'Invalid watchlist ID' });
  }

  if (typeof watched !== 'boolean') {
    return res.status(400).json({ error: 'Watched must be a boolean value' });
  }

  try {
    const watchlistItem = await prisma.watchlist.findUnique({ where: { id: watchlistId } });

    if (!watchlistItem || watchlistItem.userId !== userId) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    const updated = await prisma.watchlist.update({
      where: { id: watchlistId },
      data: { watched },
    });

    res.json(updated);
  } catch (err) {
    console.error('Failed to update watched status:', err);
    res.status(500).json({ error: 'Failed to update watched status' });
  }
});

module.exports = router;
