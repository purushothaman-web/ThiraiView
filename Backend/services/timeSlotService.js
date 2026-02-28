const { fetchFromTMDB } = require('./tmdbClient');

const findMoviesByTimeSlot = async (minutesAvailable, filters = {}) => {
  const { 
    language = 'en-US', 
    region = 'IN',
    category = 'popular'
  } = filters;

  const targetMinutes = parseInt(minutesAvailable);

  // Fetch candidates from TMDB
  const maxRuntime = targetMinutes + 5; 
  const minRuntime = Math.max(0, targetMinutes - 15);

  try {
    const params = {
      'with_runtime.lte': maxRuntime,
      'with_runtime.gte': minRuntime,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 50, // reliable ratings
      page: 1,
      region,
    };

    const data = await fetchFromTMDB('/discover/movie', params);
    
    // Process and Score
    const scored = data.results.map(m => {
      return m;
    });

    const topCandidates = scored.slice(0, 10);
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
