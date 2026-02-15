import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { Loader, Zap, Activity, Smile, Frown, AlertTriangle, Coffee, Play } from "lucide-react";
import { MovieCardSkeleton } from "../components/Skeleton";

const MoodExplorer = () => {
  const [mood, setMood] = useState("Happy");
  const [energy, setEnergy] = useState("High");
  const [pace, setPace] = useState("Medium");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = async (isLoadMore = false) => {
    setLoading(true);
    setHasMore(true);
    if (!isLoadMore) {
        setHasSearched(true);
        setPage(1);
        setMovies([]); // Clear previous
    }

    try {
      const res = await apiClient.get(`/catalog/moods`, {
        params: { mood, energy, pace, page: isLoadMore ? page + 1 : 1 }
      });
      
      const newMovies = res.data || [];
      if (isLoadMore) {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(prev => prev + 1);
      } else {
        setMovies(newMovies);
      }

      if (newMovies.length === 0) setHasMore(false);

    } catch (err) {
      console.error("Failed to fetch mood movies", err);
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { label: "Happy", icon: Smile, color: "text-amber-500", bg: "bg-amber-100" },
    { label: "Sad", icon: Frown, color: "text-blue-500", bg: "bg-blue-100" },
    { label: "Tense", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100" },
    { label: "Exciting", icon: Zap, color: "text-purple-500", bg: "bg-purple-100" },
    { label: "Chill", icon: Coffee, color: "text-green-500", bg: "bg-green-100" },
  ];

  return (
    <div className="bg-brand-black min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">
            Mood <span className="text-brand-yellow">Explorer</span>
          </h1>
          <p className="text-gray-400 text-lg">Find movies that match your current vibe, not just genre.</p>
        </div>

        {/* Controls */}
        <div className="bg-brand-gray rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-800 max-w-4xl mx-auto mb-16">
          
          {/* Mood Selector */}
          <div className="mb-10">
            <label className="block text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest text-center">I want to feel...</label>
            <div className="flex flex-wrap gap-4 justify-center">
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                    mood === m.label 
                    ? `border-brand-yellow bg-brand-yellow text-brand-black font-bold shadow-[0_0_20px_rgba(255,215,0,0.4)] transform scale-105`
                    : "border-gray-700 bg-black/40 text-gray-400 hover:border-gray-500 hover:text-white hover:bg-black/60"
                  }`}
                >
                  <m.icon size={20} />
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Energy */}
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
               <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest text-center">Energy Level</label>
               <div className="flex gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10">
                 {["High", "Low"].map((e) => (
                   <button
                      key={e}
                      onClick={() => setEnergy(e)}
                      className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                        energy === e 
                        ? "bg-brand-gray shadow-lg text-brand-yellow border border-gray-600" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                      }`}
                   >
                     {e}
                   </button>
                 ))}
               </div>
            </div>

            {/* Pace */}
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
               <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest text-center">Pacing</label>
               <div className="flex gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10">
                 {["Fast", "Medium", "Slow"].map((p) => (
                   <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                        pace === p 
                        ? "bg-brand-gray shadow-lg text-brand-yellow border border-gray-600" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                      }`}
                   >
                     {p}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <button 
            onClick={() => fetchMovies(false)}
            disabled={loading}
            className="w-full bg-brand-yellow hover:bg-yellow-400 text-brand-black font-black py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-3 text-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading && !hasSearched ? <Loader className="animate-spin" /> : "FIND MY VIBE"}
          </button>
        </div>

        {/* Results */}
        {(hasSearched || loading) && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up">
              {loading && page === 1 && (
                  Array(10).fill(0).map((_, i) => <MovieCardSkeleton key={i} />)
              )}
              {!loading && movies.map((movie, index) => (
                <Link
                  key={movie.sourceId}
                  to={`/movies/${movie.sourceId}`}
                  style={{ animationDelay: `${(index % 20) * 50}ms` }}
                  className="group relative bg-brand-gray rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-brand-yellow/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-900/10 animate-fade-in-up fill-mode-both"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-gray-900 relative">
                    <img
                      src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder-poster.png"}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                       <Play className="text-brand-yellow fill-brand-yellow drop-shadow-lg" size={40} />
                    </div>
                  </div>
                  <div className="p-4">
                     <h3 className="font-bold text-white line-clamp-1 group-hover:text-brand-yellow transition-colors text-lg">{movie.title}</h3>
                     <p className="text-sm text-gray-500 font-medium mt-1">{movie.releaseDate?.split("-")[0]}</p>
                  </div>
                </Link>
              ))}
              {movies.length === 0 && !loading && (
                 <div className="col-span-full text-center py-20">
                    <Frown className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-xl font-medium">No movies found for this vibe.</p>
                    <p className="text-gray-600 mt-2">Try adjusting the sliders to be less specific.</p>
                 </div>
              )}
            </div>
            
            {/* Load More */}
            {movies.length > 0 && hasMore && (
                <div className="text-center mt-12">
                   <button 
                     onClick={() => fetchMovies(true)}
                     disabled={loading}
                     className="px-8 py-3 bg-brand-gray border border-gray-700 text-white font-bold rounded-full hover:bg-gray-800 hover:border-brand-yellow/50 transition-all flex items-center gap-2 mx-auto"
                   >
                      {loading ? <Loader className="animate-spin" size={18} /> : "Load More Movies"}
                   </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoodExplorer;
