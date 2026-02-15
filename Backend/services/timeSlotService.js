const { fetchFromTMDB } = require('./tmdbClient');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Initial heuristic: We need a pool of movies to check runtimes against.
// Since we can't efficiently filter by exact runtime range in TMDB discover without iterating many pages,
// we will fetch a broad "popular" or "top rated" list or use discovery with `with_runtime.lte` if TMDB supports it.
// TMDB Discover Movie supports `with_runtime.gte` and `with_runtime.lte`.
// This makes it much easier!

const findMoviesByTimeSlot = async (minutesAvailable, filters = {}) => {
  const { 
    language = 'en-US', 
    region = 'IN',
    category = 'popular' // or 'top_rated'
  } = filters;

  const targetMinutes = parseInt(minutesAvailable);
  // We look for movies that are at most the available time.
  // We also want them to be at least (Target - 30) to fill the slot well, but we can score that locally.
  
  // Fetch candidates from TMDB
  // buffer: allow +5 mins just in case user can stretch, but we penalize it.
  const maxRuntime = targetMinutes + 5; 
  const minRuntime = Math.max(0, targetMinutes - 45); // Don't show too short movies

  try {
    const params = {
      'with_runtime.lte': maxRuntime,
      'with_runtime.gte': minRuntime,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 50, // reliable ratings
      page: 1,
      region,
      // language doesn't filter result language in discover usually, it sets response lang.
      // We can use with_original_language if strict, but users might watch dubbed? 
      // Let's stick to response language for now or minimal filtering.
    };

    const data = await fetchFromTMDB('/discover/movie', params);
    
    // Process and Score
    const scored = data.results.map(m => {
      // We don't always get runtime in discover results depending on API version, 
      // sometimes we do. If missing, we might need to fetch details or rely on the filter trust.
      // EDIT: TMDB discover results DO NOT include runtime usually. 
      // We have to inspect them. This is the "N+1" problem.
      // Optimization: We rely on the filter `with_runtime` so we know they are in range.
      // But to give exact "Fit Score", we might need exact runtime.
      // Let's assume for v1 we trust the filter boundaries for the "Candidate Set"
      // and do a lazy hydration or just return them as "Fits your slot".
      
      // However, to show "Fit Score" we really need the runtime.
      // Let's try to fetch details for the top 5-10 results max to be fast.
      return m;
    });

    // Hydrate top 5 for exact runtime to calculate nice score
    const topCandidates = scored.slice(0, 5);
    const hydrated = await Promise.all(topCandidates.map(async (m) => {
      const detail = await fetchFromTMDB(`/movie/${m.id}`);
      return detail;
    }));

    const results = hydrated.map(m => {
      const runtime = m.runtime || 0;
      let fitScore = 1.0;
      let reason = "Perfect fit";

      const diff = targetMinutes - runtime;
      
      if (diff < 0) {
        fitScore -= 0.2; // Slightly longer
        reason = `${Math.abs(diff)} min overtime`;
      } else if (diff < 10) {
        reason = "Perfect timing";
      } else if (diff < 30) {
        fitScore -= 0.1;
        reason = `Ends ${diff} min early`;
      } else {
        fitScore -= 0.3;
        reason = `Ends ${diff} min early (Short)`;
      }

      // Metadata boost
      if (m.vote_average > 8) fitScore += 0.1;

      return {
        id: m.id,
        sourceId: `tmdb:${m.id}`,
        title: m.title,
        posterPath: m.poster_path,
        voteAverage: m.vote_average,
        runtime,
        fitScore: Math.min(Math.max(fitScore, 0), 1).toFixed(2),
        fitReason: reason
      };
    });

    return {
      results: results.sort((a, b) => b.fitScore - a.fitScore),
      scoring: {
        target: targetMinutes,
        range: `${minRuntime}-${maxRuntime}`
      }
    };

  } catch (err) {
    console.error("TimeSlot Error:", err);
    throw err;
  }
};

module.exports = {
  findMoviesByTimeSlot
};
