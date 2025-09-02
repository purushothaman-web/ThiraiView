const MOVIE_UPLOADS_DIR = process.env.MOVIE_UPLOADS_DIR || 'uploads/movies';
const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || 'http://localhost:3000';

const { PrismaClient } = require('../generated/prisma');
const express = require('express');
const authMiddleware = require('../middleware/auth'); 
const upload = require('../middleware/upload');

const prisma = new PrismaClient();
const lofm = express.Router();


// --- /movies/search ---
lofm.get('/search', authMiddleware.optional, async (req, res) => {
  const {
    query = '',
    sort = 'title_asc',
    yearMin,
    yearMax,
    director,
    watchedOnly,
    myMoviesOnly,
    page = 1,
    limit = 10,
  } = req.query;

  const userId = req.user?.id;

  const where = {
    AND: [
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { director: { contains: query, mode: 'insensitive' } }
        ]
      },
      yearMin ? { year: { gte: parseInt(yearMin) } } : {},
      yearMax ? { year: { lte: parseInt(yearMax) } } : {},
      director ? { director: { equals: director } } : {},
    ]
  };

  if (myMoviesOnly === 'true' && userId) {
    where.AND.push({ userId: userId });
  }

  if (watchedOnly === 'true' && userId) {
    where.AND.push({
      watchlists: {
        some: {
          userId: userId,
          watched: true
        }
      }
    });
  }

  const orderByMap = {
    title_asc: { title: 'asc' },
    title_desc: { title: 'desc' },
    year_asc: { year: 'asc' },
    year_desc: { year: 'desc' },
    rating_asc: { avgRating: 'asc' },
    rating_desc: { avgRating: 'desc' },
  };

  const orderBy = orderByMap[sort] || { title: 'asc' };

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
        poster: true
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
        year: true,
        userId: true,
        poster: true, // fetch raw poster path
      },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Step 2: Add full poster URL if not already a full URL
const fullPoster =
  movie.poster?.startsWith('http://') || movie.poster?.startsWith('https://')
    ? movie.poster
    : `${ASSETS_BASE_URL}${movie.poster}`;

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

    const relativePath = `/${MOVIE_UPLOADS_DIR}/${req.file.filename}`; // ✅ Add slash manually

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: { poster: relativePath },
    });

    res.json({ message: 'Poster uploaded', poster: relativePath });
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
      data: { title, director, year, userId },
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
    if (year !== undefined) updateData.year = year;

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

    await prisma.movie.delete({ where: { id } });

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
