import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { Play, Loader, Filter, Info } from "lucide-react";
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

const GenreBlender = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // TMDB Genre IDs
  const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ];

  const toggleGenre = (genre) => {
    if (selectedGenres.find((g) => g.id === genre.id)) {
      setSelectedGenres(selectedGenres.filter((g) => g.id !== genre.id));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const fetchMovies = async () => {
    if (selectedGenres.length === 0) return;
    
    setLoading(true);
    setHasSearched(true);
    setMovies([]);

    try {
      const ids = selectedGenres.map(g => g.id).join(',');
      const res = await apiClient.get(`/catalog/genres`, { params: { ids } });
      setMovies(res.data);
    } catch (err) {
      console.error("Failed to blend genres", err);
    } finally {
      setLoading(false);
    }
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
            Genre <span className="text-brand-yellow font-bold">Blender</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-light"
          >
            Mix genres to discover the perfect cinematic crossover.
          </motion.p>
        </div>

        {/* Blender Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 max-w-4xl mx-auto mb-20 relative overflow-hidden"
        >
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-yellow/5 blur-[100px] pointer-events-none"></div>

          <div className="flex flex-wrap justify-center gap-4 mb-12 relative z-10">
            {genres.map((genre) => {
              const isSelected = selectedGenres.find((g) => g.id === genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre)}
                  className={`px-6 py-3 rounded-full font-display tracking-widest text-sm transition-all duration-300 border uppercase ${
                    isSelected
                      ? "bg-brand-yellow/10 text-brand-yellow border-brand-yellow shadow-[0_0_20px_rgba(255,215,0,0.2)] scale-105 font-bold"
                      : "bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>

          {/* Selected Summary */}
          {selectedGenres.length > 0 && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-10 relative z-10 bg-black/40 p-6 rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-3 text-gray-400 text-sm mb-4 font-display uppercase tracking-widest">
                   <Filter size={16} className="text-brand-yellow" />
                   <span>Vibe Blend Formula</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-2xl md:text-3xl font-display font-medium text-white items-center tracking-wide">
                   {selectedGenres.map((g, i) => (
                      <React.Fragment key={g.id}>
                        {i > 0 && <span className="text-brand-yellow/50">+</span>}
                        <span>{g.name}</span>
                      </React.Fragment>
                   ))}
                </div>
             </motion.div>
          )}

          <button
            onClick={fetchMovies}
            disabled={loading || selectedGenres.length === 0}
            className={`w-full py-5 rounded-full font-display font-bold text-xl transition-all flex items-center justify-center gap-3 tracking-widest relative z-10 disabled:opacity-50 disabled:hover:scale-100 uppercase ${
               selectedGenres.length === 0
               ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
               : "bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:shadow-[0_0_60px_rgba(255,215,0,0.4)]"
            }`}
          >
            {loading ? <Loader className="animate-spin" /> : "BLEND IT"}
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
                Targeted Mix
              </h2>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8"
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

                {!loading && movies.length === 0 && (
                   <motion.div variants={itemVariants} className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                      <Info className="mx-auto h-20 w-20 text-gray-600 mb-6" />
                      <p className="text-gray-400 text-2xl font-display font-medium tracking-wide">No cinematic matches found for this specific blend.</p>
                      <p className="text-gray-500 mt-4 text-lg">Try removing a genre to broaden the scope.</p>
                   </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GenreBlender;
