const express = require('express');
const router = express.Router();
const catalogService = require('../services/catalogService');
const timeSlotService = require('../services/timeSlotService');

// GET /catalog/search
router.get('/search', async (req, res) => {
  try {
    const { q, page, region, language, year } = req.query;
    if (!q) return res.status(400).json({ error: 'Query param "q" is required' });

    const results = await catalogService.searchMovies(q, page || 1, { region, language, year });
    res.json(results);
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/autocomplete
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]); // Return empty if no query

    const suggestions = await catalogService.getAutocomplete(q);
    res.json(suggestions);
  } catch (error) {
    console.error('Autocomplete Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/movies/:sourceId
router.get('/movies/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;
    const movie = await catalogService.getMovieDetail(sourceId);
    res.json(movie);
  } catch (error) {
    console.error('Movie Detail Error:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/time-slot
router.get('/time-slot', async (req, res) => {
  try {
    const { minutesAvailable, region, language } = req.query;
    if (!minutesAvailable) {
      return res.status(400).json({ error: 'minutesAvailable is required' });
    }

    const results = await timeSlotService.findMoviesByTimeSlot(minutesAvailable, { region, language });
    res.json(results);
  } catch (error) {
    console.error('TimeSlot Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/moods
router.get('/moods', async (req, res) => {
  try {
    const { mood, energy, pace } = req.query;
    if (!mood) return res.status(400).json({ error: 'Mood param is required' });
    
    const results = await catalogService.getMoviesByMood(mood, energy, pace);
    res.json(results);
  } catch (error) {
    console.error('Mood Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/dna/:sourceId
router.get('/dna/:sourceId', async (req, res) => {
  try {
    const { sourceId } = req.params;
    const results = await catalogService.getMovieDNA(sourceId);
    res.json(results);
  } catch (error) {
    console.error('DNA Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/multi?ids=tmdb:123,tmdb:456
router.get('/multi', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.json([]);
    
    const idList = ids.split(',');
    const results = await catalogService.getMoviesByIds(idList);
    res.json(results);
  } catch (error) {
    console.error('Multi fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/collection/:type
router.get('/collection/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const results = await catalogService.getCollection(type);
    res.json(results);
  } catch (error) {
    console.error('Collection fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/people/search?q=tom
router.get('/people/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await catalogService.searchPeople(q);
    res.json(results);
  } catch (error) {
    console.error('Person Search Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /catalog/discover/cast?ids=123,456
router.get('/discover/cast', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'ids param is required' });
    
    // ids can be comma separated. Service handles splitting/joining.
    const results = await catalogService.getMoviesByCast(ids);
    res.json(results);
  } catch (error) {
    console.error('Cast Discover Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
