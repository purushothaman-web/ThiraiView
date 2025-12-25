const { PrismaClient } = require('../generated/prisma');
const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { deleteImage, getFullUrl, USE_CLOUDINARY } = require('../config/cloudinary');

const prisma = new PrismaClient();
const lofm = express.Router();


// --- /movies/search ---
lofm.get('/search', authMiddleware.optional, async (req, res) => {
  const {
    query = '',
    page = 1,
    limit = 10,
  } = req.query;

  const userId = req.user?.id;

  const where = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { director: { contains: query, mode: 'insensitive' } }
    ]
  };

  const orderBy = { title: 'asc' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    const total = await prisma.movie.count({ where });

    const movies = await prisma.movie.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        reviews: {
          select: { rating: true }
        }
      }
    });

    const moviesWithAvg = movies.map(movie => {
      const ratings = movie.reviews.map(r => r.rating);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;

      return {
        ...movie,
        avgRating: avgRating ? parseFloat(avgRating) : null
      };
    });

    res.json({
      movies: moviesWithAvg,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- /movies/autocomplete ---
lofm.get('/autocomplete', async (req, res) => {
  const { query = '' } = req.query;

  try {
    const results = await prisma.movie.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        id: true,
        title: true,
        poster: true,
        genre: true
      },
      take: 10
    });

    res.json(results);
  } catch (err) {
    console.error('Autocomplete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /movies - Fetch all movies with avgRating
lofm.get('/', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();

    // Calculate average rating for each movie
    const moviesWithAvg = await Promise.all(
      movies.map(async (movie) => {
        const avgRatingResult = await prisma.review.aggregate({
          where: { movieId: movie.id },
          _avg: { rating: true },
        });

        return {
          ...movie,
          avgRating: avgRatingResult._avg.rating || null,
        };
      })
    );

    res.json(moviesWithAvg);
  } catch (error) {
    console.error('Error fetching movies with avgRating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /movies/:id - Fetch a single movie with avgRating
lofm.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    // Step 1: Fetch the movie
    const movie = await prisma.movie.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        director: true,
        director: true,
        year: true,
        genre: true,
        userId: true,
        poster: true, // fetch raw poster path
      },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Step 2: Get full URL (Cloudinary or local)
    const fullPoster = getFullUrl(movie.poster);

    // Step 3: Get average rating
    const avgRatingResult = await prisma.review.aggregate({
      where: { movieId: id },
      _avg: { rating: true },
    });

    res.json({
      ...movie,
      poster: fullPoster,
      avgRating: avgRatingResult._avg.rating || null,
    });
  } catch (error) {
    console.error('Error fetching movie with avgRating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//for poster
lofm.post('/:id/poster', authMiddleware, upload.single('poster'), async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    if (movie.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old poster if it exists
    if (movie.poster) {
      try {
        await deleteImage(movie.poster);
      } catch (deleteError) {
        console.error('Error deleting old poster:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Update movie with new poster URL
    const posterPath = USE_CLOUDINARY ? req.file.path : `/${process.env.MOVIE_UPLOADS_DIR || 'uploads/movies'}/${req.file.filename}`;

    await prisma.movie.update({
      where: { id },
      data: { poster: posterPath },
    });

    // Return full updated movie payload for frontend to merge state
    const updated = await prisma.movie.findUnique({
      where: { id },
      select: { id: true, title: true, director: true, year: true, genre: true, userId: true, poster: true },
    });

    res.json({ ...updated, poster: getFullUrl(updated.poster) });
  } catch (error) {
    console.error('Poster upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// POST / - Add a new movie (protected route)
lofm.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, director, year } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !director || !year) {
      return res.status(400).json({ error: 'Title, director, and year are required.' });
    }

    // Check for duplicate (same title and year)
    const existingMovie = await prisma.movie.findFirst({
      where: { title, year }
    });

    if (existingMovie) {
      return res.status(400).json({ error: 'Movie already exists.' });
    }

    // Insert movie
    const newMovie = await prisma.movie.create({
      data: {
        title,
        director,
        year,
        userId,
        genre: req.body.genre || null
      },
    });


    return res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error creating movie:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /movies/:id - update movie by ID (protected)
lofm.put('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id; // authenticated user ID

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  const { title, director, year } = req.body;

  if (!title && !director && !year) {
    return res.status(400).json({ error: 'At least one field must be provided to update' });
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (movie.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this movie' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (director !== undefined) updateData.director = director;
    if (director !== undefined) updateData.director = director;
    if (year !== undefined) updateData.year = year;
    if (req.body.genre !== undefined) updateData.genre = req.body.genre;

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: updateData,
    });

    return res.json(updatedMovie);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Movie not found' });
    }

    console.error('Error updating movie:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// DELETE /movies/:id - delete a movie (protected)
lofm.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid movie ID' });
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (movie.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this movie' });
    }

    // Delete dependent records first to satisfy FK constraints
    await prisma.$transaction(async (tx) => {
      // Delete review likes for reviews of this movie
      const reviewIds = (
        await tx.review.findMany({ where: { movieId: id }, select: { id: true } })
      ).map((r) => r.id);

      if (reviewIds.length > 0) {
        await tx.reviewLike.deleteMany({ where: { reviewId: { in: reviewIds } } });
      }

      // Delete reviews
      await tx.review.deleteMany({ where: { movieId: id } });

      // Delete watchlist entries
      await tx.watchlist.deleteMany({ where: { movieId: id } });

      // Finally delete the movie
      await tx.movie.delete({ where: { id } });
    });

    return res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Movie not found' });
    }

    console.error('Error deleting movie:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = lofm;
