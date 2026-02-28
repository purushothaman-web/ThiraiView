import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Clock, Loader, ThumbsUp, Play } from "lucide-react";
import { Link } from "react-router-dom";
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

const TimeSlotPicker = () => {
  const [minutes, setMinutes] = useState(120);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    setHasSearched(true);
    setMovies([]);
    try {
      const res = await apiClient.get(`/catalog/time-slot?minutesAvailable=${minutes}`);
      setMovies(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch time slot movies", err);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

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
            Time <span className="text-brand-yellow font-bold">Slot</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-light"
          >
            Tell us how much time you have, and we'll fill it perfectly.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl p-8 md:p-14 rounded-[3rem] shadow-2xl border border-white/10 max-w-4xl mx-auto mb-20 relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-brand-yellow/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          
          <div className="relative z-10 text-center flex flex-col items-center">
             <motion.div 
               key={minutes}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-7xl md:text-9xl font-display font-medium text-white mb-2 tabular-nums tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
             >
               {formatHours(minutes)}
             </motion.div>
             <p className="text-brand-yellow font-display font-bold uppercase tracking-[0.3em] text-sm md:text-base mb-12">Available Time</p>
             
             <div className="relative mb-14 w-full max-w-2xl px-4 group">
               <input
                type="range"
                min="60"
                max="240"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full h-4 bg-black/60 rounded-full appearance-none cursor-pointer accent-brand-yellow hover:accent-yellow-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-inner border border-white/10 transition-all"
               />
               <div className="flex justify-between text-xs md:text-sm font-display font-bold text-gray-500 mt-6 uppercase tracking-widest px-2 group-hover:text-gray-400 transition-colors">
                 <span>Short (1h)</span>
                 <span>Standard (2h)</span>
                 <span>Epic (3h+)</span>
               </div>
             </div>

             <button 
               onClick={fetchMovies}
               disabled={loading}
               className="bg-brand-yellow hover:bg-brand-yellow/90 text-[#050505] text-xl font-display font-bold py-5 px-14 rounded-full transition-all shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:shadow-[0_0_60px_rgba(255,215,0,0.4)] flex items-center justify-center gap-4 mx-auto tracking-widest relative z-10 disabled:opacity-70 disabled:hover:scale-100 uppercase"
             >
               {loading ? <Loader className="animate-spin" size={28} /> : <> <Clock size={24} /> FIND MOVIES </>}
             </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mt-12"
            >
              {!loading && movies.length > 0 && (
                <div className="flex items-end gap-4 mb-10 pl-2">
                  <h2 className="text-2xl font-display font-medium text-white border-l-4 border-brand-yellow pl-4 uppercase tracking-widest">
                    Perfect Fits
                  </h2>
                  <span className="text-brand-yellow font-display text-lg mb-0.5 tracking-wider">({movies.length})</span>
                </div>
              )}
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
              >
                {loading && Array(10).fill(0).map((_, i) => (
                  <motion.div variants={itemVariants} key={`skeleton-${i}`}>
                    <MovieCardSkeleton />
                  </motion.div>
                ))}

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
                          src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.png"} 
                          alt={movie.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                           <Play className="text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" size={48} />
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-brand-yellow font-display text-sm font-bold px-3 py-1 rounded-full border border-brand-yellow/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                          {movie.runtime}m
                        </div>
                      </div>
                      
                      <div className="px-1 relative z-10">
                        <h3 className="font-display font-medium text-white line-clamp-1 group-hover:text-brand-yellow transition-colors text-lg tracking-wide">{movie.title}</h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-500 font-display tracking-widest">{movie.releaseDate?.split('-')[0]}</span>
                          <span className="text-brand-yellow font-display flex items-center gap-1.5 text-sm font-medium"><ThumbsUp size={14} /> {movie.voteAverage?.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {!loading && movies.length === 0 && (
                <motion.div 
                  variants={itemVariants}
                  className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 mt-8"
                >
                  <Clock className="mx-auto h-20 w-20 text-gray-600 mb-6" />
                  <p className="text-gray-400 text-2xl font-display font-medium tracking-wide">No exact matches found.</p>
                  <p className="text-gray-500 mt-4 text-lg">Try adjusting your available time slightly.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TimeSlotPicker;
