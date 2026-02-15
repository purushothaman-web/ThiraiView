const axios = require('axios');

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 5000,
});

const fetchFromTMDB = async (endpoint, params = {}) => {
  try {
    const response = await tmdbClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      if (status === 404) return null; // Not found is strictly null
      throw new Error(`TMDB API Error: ${status} - ${error.response.data.status_message || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('TMDB API Error: No response received from TMDB');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`TMDB API Setup Error: ${error.message}`);
    }
  }
};

module.exports = {
  fetchFromTMDB,
};
