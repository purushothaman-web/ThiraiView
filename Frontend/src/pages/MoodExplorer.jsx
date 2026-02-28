import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { Loader, Zap, Smile, Frown, AlertTriangle, Coffee, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MovieCardSkeleton } from "../components/Skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

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
    { label: "Happy", icon: Smile },
    { label: "Sad", icon: Frown },
    { label: "Tense", icon: AlertTriangle },
    { label: "Exciting", icon: Zap },
    { label: "Chill", icon: Coffee },
  ];

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="bg-[#050505] min-h-screen pt-28 pb-20 px-4 md:px-12 relative z-10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-10 mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-medium mb-6 text-white uppercase tracking-wider drop-shadow-md"
          >
            Mood <span className="text-brand-yellow font-bold">Explorer</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-light"
          >
            Find movies that match your current cinematic vibe.
          </motion.p>
        </div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 max-w-4xl mx-auto mb-20 relative overflow-hidden"
        >
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-yellow/5 blur-[100px] pointer-events-none"></div>

           {/* Mood Selector */}
           <div className="mb-12 relative z-10">
            <label className="block text-sm font-display font-medium text-gray-500 mb-6 uppercase tracking-[0.2em] text-center">I want to feel</label>
            <div className="flex flex-wrap gap-4 justify-center">
              {moods.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full border transition-all duration-300 font-display tracking-wide ${
                    mood === m.label 
                    ? `border-brand-yellow bg-brand-yellow/10 text-brand-yellow font-bold shadow-[0_0_30px_rgba(255,215,0,0.15)] transform scale-105`
                    : "border-white/10 bg-black/40 text-gray-400 hover:border-gray-500 hover:text-white hover:bg-black/60"
                  }`}
                >
                  <m.icon size={22} className={mood === m.label ? "animate-pulse" : ""} />
                  <span className="text-lg">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative z-10">
            {/* Energy */}
            <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
               <label className="block text-xs font-display font-bold text-gray-500 mb-6 uppercase tracking-[0.2em] text-center">Energy Level</label>
               <div className="flex gap-3 bg-black/60 p-2 rounded-xl border border-white/5">
                 {["High", "Low"].map((e) => (
                   <button
                      key={e}
                      onClick={() => setEnergy(e)}
                      className={`flex-1 py-3 rounded-lg font-display tracking-widest text-sm transition-all uppercase ${
                        energy === e 
                        ? "bg-white/10 shadow-lg text-brand-yellow border border-white/10" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                      }`}
                   >
                     {e}
                   </button>
                 ))}
               </div>
            </div>

            {/* Pace */}
            <div className="bg-black/40 p-8 rounded-2xl border border-white/5">
               <label className="block text-xs font-display font-bold text-gray-500 mb-6 uppercase tracking-[0.2em] text-center">Pacing</label>
               <div className="flex gap-3 bg-black/60 p-2 rounded-xl border border-white/5">
                 {["Fast", "Medium", "Slow"].map((p) => (
                   <button
                      key={p}
                      onClick={() => setPace(p)}
                      className={`flex-1 py-3 rounded-lg font-display tracking-widest text-sm transition-all uppercase ${
                        pace === p 
                        ? "bg-white/10 shadow-lg text-brand-yellow border border-white/10" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
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
            className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-[#050505] font-display font-bold py-5 rounded-full transition-all shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:shadow-[0_0_60px_rgba(255,215,0,0.4)] flex items-center justify-center gap-3 text-xl tracking-widest relative z-10 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading && !hasSearched ? <Loader className="animate-spin" /> : "DISCOVER VIBE"}
          </button>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {(hasSearched || loading) && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-display font-medium text-white mb-8 pl-2 border-l-4 border-brand-yellow uppercase tracking-widest">
                Curated Results
              </h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
              >
                {loading && page === 1 && (
                    Array(10).fill(0).map((_, i) => (
                      <motion.div variants={itemVariants} key={`skeleton-${i}`}>
                        <MovieCardSkeleton />
                      </motion.div>
                    ))
                )}
                {!loading && movies.map((movie) => (
                  <motion.div variants={itemVariants} key={movie.sourceId}>
                    <Link
                      to={`/movies/${movie.sourceId}`}
                      className="group block relative"
                    >
                      {/* Glow Backdrop */}
                      <div className="absolute inset-0 bg-brand-yellow/0 group-hover:bg-brand-yellow/20 translate-y-2 rounded-xl blur-xl transition-all duration-500 -z-10"></div>
                      
                      <div className="rounded-xl overflow-hidden bg-[#111] aspect-[2/3] mb-3 border border-white/5 shadow-2xl relative z-10 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]">
                        <img
                          src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder-poster.png"}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                           <Play className="text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" size={40} />
                        </div>
                      </div>
                      
                      <div className="px-1 relative z-10">
                         <h3 className="font-display font-medium text-white line-clamp-1 group-hover:text-brand-yellow transition-colors text-lg tracking-wide">{movie.title}</h3>
                         <p className="text-sm text-gray-500 font-display mt-1">{movie.releaseDate?.split("-")[0]}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {movies.length === 0 && !loading && (
                   <motion.div variants={itemVariants} className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                      <Frown className="mx-auto h-20 w-20 text-gray-600 mb-6" />
                      <p className="text-gray-400 text-2xl font-display font-medium tracking-wide">No cinematic matches found for this vibe.</p>
                      <p className="text-gray-500 mt-4 text-lg">Try adjusting the constraints.</p>
                   </motion.div>
                )}
              </motion.div>
              
              {/* Load More */}
              {movies.length > 0 && hasMore && (
                  <div className="text-center mt-16 pb-10">
                     <button 
                       onClick={() => fetchMovies(true)}
                       disabled={loading}
                       className="px-10 py-4 bg-transparent border border-white/20 text-white font-display uppercase tracking-widest text-sm rounded-full hover:bg-white/10 hover:border-brand-yellow hover:text-brand-yellow transition-all flex items-center justify-center gap-3 mx-auto shadow-lg"
                     >
                        {loading ? <Loader className="animate-spin text-brand-yellow" size={20} /> : "Load More"}
                     </button>
                  </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MoodExplorer;
