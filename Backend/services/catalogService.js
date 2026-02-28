const { fetchFromTMDB } = require('./tmdbClient');

const normalizeMovie = (tmdbMovie) => {
  return {
    source: 'tmdb',
    sourceMovieId: tmdbMovie.id,
    sourceId: `tmdb:${tmdbMovie.id}`,
    title: tmdbMovie.title,
    overview: tmdbMovie.overview,
    runtime: tmdbMovie.runtime,
    releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
    posterPath: tmdbMovie.poster_path,
    backdropPath: tmdbMovie.backdrop_path,
    voteAverage: tmdbMovie.vote_average,
    voteCount: tmdbMovie.vote_count,
    originalLanguage: tmdbMovie.original_language,
  };
};

// Search Movies directly from TMDB
const searchMovies = async (query, page = 1, filters = {}) => {
  const { region = 'IN', language = 'en-US', year } = filters;

  const tmdbParams = {
    query,
    page,
    include_adult: false,
    region,
    language,
  };
  if (year) tmdbParams.primary_release_year = year;

  const data = await fetchFromTMDB('/search/movie', tmdbParams);
  
  const resultPayload = {
    results: data.results.map(m => ({
      id: m.id,
      sourceId: `tmdb:${m.id}`,
      title: m.title,
      posterPath: m.poster_path,
      backdropPath: m.backdrop_path,
      releaseDate: m.release_date,
      voteAverage: m.vote_average,
      overview: m.overview,
    })),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    source: 'tmdb'
  };

  return resultPayload;
};

// Get Movie Detail directly from TMDB
const getMovieDetail = async (sourceId) => {
  if (!sourceId.startsWith('tmdb:')) throw new Error('Invalid sourceId format');
  const tmdbId = parseInt(sourceId.split(':')[1]);

  const data = await fetchFromTMDB(`/movie/${tmdbId}`, {
    append_to_response: 'credits,watch/providers,similar,videos',
  });

  const normalized = normalizeMovie(data);

  return {
    ...normalized,
    genres: data.genres || [],
    languages: data.spoken_languages || [],
    credits: data.credits || {},
    providers: data['watch/providers'] || {},
    videos: data.videos || {},
    cast: data.credits?.cast || [],
    source: 'tmdb'
  };
};

const getAutocomplete = async (query) => {
  const data = await fetchFromTMDB('/search/movie', { query, page: 1 });
  const suggestions = data.results.slice(0, 10).map(m => ({
    sourceId: `tmdb:${m.id}`,
    title: m.title,
    year: m.release_date ? m.release_date.split('-')[0] : '',
    posterPath: m.poster_path
  }));

  return suggestions;
};

const getMoviesByMood = async (mood, energy, pace) => {
  // Mapping logic
  const moodMap = {
    Happy: { with_genres: '35,10751,12', without_genres: '27,18' }, // Comedy, Family, Adventure
    Sad: { with_genres: '18,10749', without_genres: '35,28' },   // Drama, Romance
    Tense: { with_genres: '53,27,9648', without_genres: '35,10751' }, // Thriller, Horror, Mystery
    Exciting: { with_genres: '28,12,878', without_genres: '99' }, // Action, Adventure, Sci-Fi
    Chill: { with_genres: '99,10402,36', without_genres: '28,27' }, // Doc, Music, History
  };

  const energyMap = {
    High: { sort_by: 'popularity.desc', 'vote_count.gte': 500 }, // Blockbusters
    Low: { sort_by: 'vote_average.desc', 'vote_count.gte': 50 }, // Hidden Gems/Indie feel
  };

  const paceMap = {
    Fast: { with_runtime: { lte: 100 } }, // Shorter movies feel faster typically
    Slow: { with_runtime: { gte: 120 } },
    Medium: { with_runtime: { gte: 90, lte: 130 } }
  };

  const params = {
    page: 1,
    include_adult: false,
    ...moodMap[mood],
    ...energyMap[energy] || energyMap.High,
  };

  if (paceMap[pace]) {
    if (paceMap[pace].with_runtime.lte) params['with_runtime.lte'] = paceMap[pace].with_runtime.lte;
    if (paceMap[pace].with_runtime.gte) params['with_runtime.gte'] = paceMap[pace].with_runtime.gte;
  }

  // Fetch from TMDB Discover
  const data = await fetchFromTMDB('/discover/movie', params);
  
  return data.results.map(m => ({
    sourceId: `tmdb:${m.id}`,
    title: m.title,
    posterPath: m.poster_path,
    voteAverage: m.vote_average,
    overview: m.overview,
    releaseDate: m.release_date
  }));
};

const getMovieDNA = async (sourceId) => {
  // We need details to compute DNA
  const movie = await getMovieDetail(sourceId);
  const genres = movie.genres.map(g => g.name.toLowerCase());
  
  // Normalized 0-1 vector
  const dna = {
    action: genres.some(g => ['action', 'adventure', 'war'].includes(g)) ? 0.9 : 0.1,
    emotion: genres.some(g => ['drama', 'romance'].includes(g)) ? 0.8 : 0.2,
    tension: genres.some(g => ['thriller', 'horror', 'mystery', 'crime'].includes(g)) ? 0.9 : 0.1,
    thought: genres.some(g => ['documentary', 'history', 'science fiction'].includes(g)) ? 0.8 : 0.3,
    lighthearted: genres.some(g => ['comedy', 'family', 'animation'].includes(g)) ? 0.9 : 0.1,
  };

  // Adjust based on vote average (Quality) and runtime (Depth/Weight)
  if (movie.voteAverage > 8) dna.thought += 0.1;
  if (movie.runtime > 150) dna.thought += 0.1;

  // Clamp values 0-1
  Object.keys(dna).forEach(k => dna[k] = Math.min(Math.max(dna[k], 0), 1));
  
  // Find similar movies (proxy for now: TMDB similar)
  // In a real vector DB, we'd query by vector distance.
  let similar = [];
  try {
     const simData = await fetchFromTMDB(`/movie/${movie.sourceMovieId}/recommendations`);
     similar = simData.results.slice(0, 5).map(m => ({
       sourceId: `tmdb:${m.id}`,
       title: m.title,
       posterPath: m.poster_path
     }));
  } catch(e) { /* ignore */ }

  return { vector: dna, similar };
};

const getMoviesByIds = async (ids) => {
  // ids = ['tmdb:123', 'tmdb:456']
  const promises = ids.map(id => getMovieDetail(id));
  return Promise.all(promises);
};

const getCollection = async (type) => {
  let endpoint = '/discover/movie';
  let params = { page: 1, include_adult: false, region: 'IN' };

  switch (type) {
    case 'trending':
      endpoint = '/trending/movie/week';
      params = {}; // Trending doesn't accept many filters
      break;
    case 'top_rated':
      endpoint = '/movie/top_rated';
      break;
    case 'upcoming':
      endpoint = '/movie/upcoming';
      break;
    case 'action':
      params.with_genres = '28';
      params.sort_by = 'popularity.desc';
      break;
    case 'comedy':
      params.with_genres = '35';
      params.sort_by = 'popularity.desc';
      break;
    case 'horror':
      params.with_genres = '27';
      params.sort_by = 'popularity.desc';
      break;
    case 'scifi':
      params.with_genres = '878';
      params.sort_by = 'popularity.desc';
      break;
    case 'indian':
      endpoint = '/discover/movie';
      params.region = 'IN';
      params.with_original_language = 'hi|ta|te|ml|kn'; // Hindi, Tamil, Telugu, Malayalam, Kannada
      params.sort_by = 'popularity.desc';
      params['primary_release_date.lte'] = new Date().toISOString().split('T')[0]; // Only released movies
      break;
    case 'anime':
      endpoint = '/discover/movie';
      params.with_genres = '16'; // Animation
      params.with_original_language = 'ja';
      params.sort_by = 'popularity.desc';
      break;
    default:
      // Default to popular
      endpoint = '/movie/popular';
  }

  const data = await fetchFromTMDB(endpoint, params);
  
  return data.results.map(m => ({
    sourceId: `tmdb:${m.id}`,
    title: m.title,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    voteAverage: m.vote_average,
    overview: m.overview,
    releaseDate: m.release_date
  }));
};

// Search People (Actors/Directors)
const searchPeople = async (query) => {
  const data = await fetchFromTMDB('/search/person', { query, page: 1 });
  return data.results.slice(0, 10).map(p => ({
    id: p.id,
    name: p.name,
    profilePath: p.profile_path,
    knownFor: p.known_for?.map(k => k.title || k.name).join(', ')
  }));
};

// Get Movies by Cast (Mixer)
const getMoviesByCast = async (actorIds) => {
  // actorIds is comma separated string of IDs e.g. "123,456"
  // TMDB discover: with_people. 
  // We use pipe | for OR logic (movies with Actor A OR Actor B) to show more results
  // Or comma , for AND logic. 
  // Let's use OR (|) effectively.
  // Actually, let's treat the input as an array or string and join with |
  const formattedIds = actorIds.replace(/,/g, '|'); 
  
  const data = await fetchFromTMDB('/discover/movie', {
    with_people: formattedIds,
    sort_by: 'popularity.desc',
    include_adult: false,
    page: 1
  });

  return data.results.map(m => ({
    sourceId: `tmdb:${m.id}`,
    title: m.title,
    posterPath: m.poster_path,
    voteAverage: m.vote_average,
    releaseDate: m.release_date
  }));
};

// Get Movies by Genres (Blender)
const getMoviesByGenres = async (genreIds) => {
  // genreIds is comma separated string of IDs e.g. "28,878"
  // TMDB discover: with_genres.
  // We use comma , for AND logic (movies with Genre A AND Genre B)
  // We use pipe | for OR logic.
  // For a "Blender", AND logic (comma) makes sense to find intersections.
  
  const data = await fetchFromTMDB('/discover/movie', {
    with_genres: genreIds,
    sort_by: 'popularity.desc',
    include_adult: false,
    page: 1,
    'vote_count.gte': 100 // Filter out noise
  });

  return data.results.map(m => ({
    sourceId: `tmdb:${m.id}`,
    title: m.title,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    voteAverage: m.vote_average,
    releaseDate: m.release_date,
    overview: m.overview
  }));
};

module.exports = {
  searchMovies,
  getMovieDetail,
  getAutocomplete,
  getMoviesByMood,
  getMovieDNA,
  getMoviesByIds,
  getCollection,
  searchPeople,
  getMoviesByCast,
  getMoviesByGenres
};
