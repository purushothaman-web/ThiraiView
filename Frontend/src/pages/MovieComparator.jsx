import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Search, X, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

const MovieComparator = () => {
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");
  const [movieLeft, setMovieLeft] = useState(null);
  const [movieRight, setMovieRight] = useState(null);
  const [suggestionsLeft, setSuggestionsLeft] = useState([]);
  const [suggestionsRight, setSuggestionsRight] = useState([]);

  const search = async (q, setSuggestions) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
       const res = await apiClient.get(`/catalog/autocomplete?q=${q}`);
       setSuggestions(res.data);
    } catch(err) {
       console.error(err);
    }
  };

  const selectMovie = async (movie, side) => {
    try {
      const res = await apiClient.get(`/catalog/movies/${movie.sourceId}`);
      if (side === "left") {
        setMovieLeft(res.data);
        setSuggestionsLeft([]);
        setSearchLeft("");
      } else {
        setMovieRight(res.data);
        setSuggestionsRight([]);
        setSearchRight("");
      }
    } catch (err) {
       console.error("Failed to load movie details", err);
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
            Movie <span className="text-brand-yellow font-bold">Comparator</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-light"
          >
            See how cinematic titans stack up side-by-side.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start relative mb-16">
          {/* Center VS Badge */}
          <div className="absolute left-1/2 top-10 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-30 hidden md:flex items-center justify-center pointer-events-none">
            <div className="bg-[#0a0a0a] p-3 rounded-full shadow-2xl border border-white/10">
              <div className="bg-brand-yellow text-brand-black font-display font-black text-3xl w-20 h-20 flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                 VS
              </div>
            </div>
          </div>

          {/* Left Side Container */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/5 min-h-[500px] flex flex-col relative overflow-visible"
          >
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-yellow text-brand-black text-sm font-display font-bold px-6 py-1.5 rounded-full border border-brand-yellow/50 uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                Contender A
             </div>
             
             {!movieLeft ? (
               <div className="relative flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                  <div className="mb-8 text-center">
                    <div className="w-24 h-24 bg-black/40 rounded-full mx-auto flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                      <Search className="text-gray-500" size={36} />
                    </div>
                    <h3 className="text-white font-display font-medium text-2xl tracking-wide">Select a Movie</h3>
                  </div>
                  
                  <div className="relative group z-40">
                    <Search className="absolute left-6 top-4 text-gray-400 group-focus-within:text-brand-yellow transition-colors" size={24} />
                    <input 
                      type="text" 
                      placeholder="Search title..."
                      className="w-full py-4 pl-16 pr-6 rounded-full bg-black/60 border border-white/10 text-white font-display text-lg focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all placeholder-gray-600 shadow-inner"
                      value={searchLeft}
                      onChange={(e) => {
                        setSearchLeft(e.target.value);
                        search(e.target.value, setSuggestionsLeft);
                      }}
                    />
                    
                    <AnimatePresence>
                      {suggestionsLeft.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-16 left-0 w-full bg-[#111] shadow-2xl rounded-2xl z-50 overflow-hidden border border-white/10 max-h-72 overflow-y-auto"
                        >
                          {suggestionsLeft.map(m => (
                            <div key={m.sourceId} onClick={() => selectMovie(m, "left")} className="p-4 hover:bg-white/5 cursor-pointer flex gap-4 items-center border-b border-white/5 last:border-none transition-colors">
                              <img src={m.posterPath ? `https://image.tmdb.org/t/p/w92${m.posterPath}` : "/placeholder.png"} alt="" className="w-12 h-16 object-cover rounded flex-shrink-0 bg-gray-800" />
                              <div className="overflow-hidden">
                                <p className="font-display font-medium text-base text-gray-200 truncate">{m.title}</p>
                                <p className="text-sm font-display text-brand-yellow tracking-wider mt-1">{m.year}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
             ) : (
               <MovieCard movie={movieLeft} onRemove={() => setMovieLeft(null)} color="text-brand-yellow" glowColor="rgba(255,215,0,0.2)" />
             )}
          </motion.div>

          {/* Right Side Container */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/5 min-h-[500px] flex flex-col relative overflow-visible"
          >
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-300 text-brand-black text-sm font-display font-bold px-6 py-1.5 rounded-full border border-gray-400 uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                Contender B
             </div>
             
             {!movieRight ? (
               <div className="relative flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                  <div className="mb-8 text-center">
                    <div className="w-24 h-24 bg-black/40 rounded-full mx-auto flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                      <Search className="text-gray-500" size={36} />
                    </div>
                    <h3 className="text-white font-display font-medium text-2xl tracking-wide">Select a Movie</h3>
                  </div>
                  
                  <div className="relative group z-40">
                    <Search className="absolute left-6 top-4 text-gray-400 group-focus-within:text-white transition-colors" size={24} />
                    <input 
                      type="text" 
                      placeholder="Search title..."
                      className="w-full py-4 pl-16 pr-6 rounded-full bg-black/60 border border-white/10 text-white font-display text-lg focus:border-white focus:ring-1 focus:ring-white transition-all placeholder-gray-600 shadow-inner"
                      value={searchRight}
                      onChange={(e) => {
                        setSearchRight(e.target.value);
                        search(e.target.value, setSuggestionsRight);
                      }}
                    />
                    
                    <AnimatePresence>
                      {suggestionsRight.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-16 left-0 w-full bg-[#111] shadow-2xl rounded-2xl z-50 overflow-hidden border border-white/10 max-h-72 overflow-y-auto"
                        >
                          {suggestionsRight.map(m => (
                            <div key={m.sourceId} onClick={() => selectMovie(m, "right")} className="p-4 hover:bg-white/5 cursor-pointer flex gap-4 items-center border-b border-white/5 last:border-none transition-colors">
                              <img src={m.posterPath ? `https://image.tmdb.org/t/p/w92${m.posterPath}` : "/placeholder.png"} alt="" className="w-12 h-16 object-cover rounded flex-shrink-0 bg-gray-800" />
                              <div className="overflow-hidden">
                                <p className="font-display font-medium text-base text-gray-200 truncate">{m.title}</p>
                                <p className="text-sm font-display text-gray-400 tracking-wider mt-1">{m.year}</p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
             ) : (
               <MovieCard movie={movieRight} onRemove={() => setMovieRight(null)} color="text-white" glowColor="rgba(255,255,255,0.1)" />
             )}
          </motion.div>
        </div>

        {/* Comparison Table */}
        <AnimatePresence>
          {movieLeft && movieRight && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="grid grid-cols-3 text-center p-8 bg-black/60 font-display text-xl uppercase tracking-widest border-b border-white/10">
                <div className="text-brand-yellow font-bold truncate px-4">{movieLeft.title}</div>
                <div className="text-gray-500 font-medium self-center scale-90">Head to Head</div>
                <div className="text-white font-bold truncate px-4">{movieRight.title}</div>
              </div>
              
              <div className="divide-y divide-white/5 py-4">
                <CompareRow 
                   label="Runtime" 
                   valA={`${movieLeft.runtime} min`} 
                   valB={`${movieRight.runtime} min`} 
                   winner={movieLeft.runtime > movieRight.runtime ? 'left' : (movieLeft.runtime < movieRight.runtime ? 'right' : 'draw')} 
                />
                <CompareRow 
                   label="Rating" 
                   valA={movieLeft.voteAverage?.toFixed(1)} 
                   valB={movieRight.voteAverage?.toFixed(1)} 
                   winner={movieLeft.voteAverage > movieRight.voteAverage ? 'left' : (movieLeft.voteAverage < movieRight.voteAverage ? 'right' : 'draw')} 
                />
                 <CompareRow 
                   label="Release Year" 
                   valA={movieLeft.releaseDate?.split('-')[0]} 
                   valB={movieRight.releaseDate?.split('-')[0]} 
                   winner={movieLeft.releaseDate < movieRight.releaseDate ? 'left' : (movieLeft.releaseDate > movieRight.releaseDate ? 'right' : 'draw')}
                />
                <CompareRow 
                   label="Genres" 
                   valA={movieLeft.genres?.slice(0,2).map(g=>g.name).join(", ")} 
                   valB={movieRight.genres?.slice(0,2).map(g=>g.name).join(", ")} 
                   winner={null}
                   isText
                />
                 <CompareRow 
                   label="Popularity" 
                   valA={Math.round(movieLeft.popularity)} 
                   valB={Math.round(movieRight.popularity)} 
                   winner={movieLeft.popularity > movieRight.popularity ? 'left' : (movieLeft.popularity < movieRight.popularity ? 'right' : 'draw')} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const MovieCard = ({ movie, onRemove, color, glowColor }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center text-center h-full justify-center"
  >
    <div className="relative w-48 lg:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl mb-8 group transition-all duration-500 hover:scale-105"
         style={{ boxShadow: `0 20px 40px -10px ${glowColor}` }}
    >
      <img src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.png"} alt={movie.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <button 
        onClick={onRemove} 
        className="absolute top-3 right-3 p-2 bg-black/80 backdrop-blur-md text-white rounded-full hover:bg-red-500 hover:text-white transition-all border border-white/20 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <X size={20} />
      </button>
    </div>
    <h3 className="text-3xl font-display font-medium text-white mb-3 leading-tight tracking-wide">{movie.title}</h3>
    <p className={`text-base font-display font-medium uppercase tracking-widest ${color}`}>
      {movie.releaseDate?.split('-')[0]}
    </p>
  </motion.div>
);

const CompareRow = ({ label, valA, valB, winner, isText }) => (
  <div className="grid grid-cols-3 text-center py-6 px-4 hover:bg-white/5 transition-colors group">
    <div className={`flex items-center justify-center font-display ${isText ? 'text-base md:text-lg' : 'text-xl md:text-2xl'} ${winner === 'left' ? 'text-brand-yellow font-bold translate-x-2 drop-shadow-md' : 'text-gray-400'} transition-transform duration-500`}>
      {valA}
    </div>
    <div className="text-xs md:text-sm text-gray-500 font-display font-medium uppercase tracking-[0.2em] self-center group-hover:text-gray-300 transition-colors">
      {label}
    </div>
    <div className={`flex items-center justify-center font-display ${isText ? 'text-base md:text-lg' : 'text-xl md:text-2xl'} ${winner === 'right' ? 'text-white font-bold -translate-x-2 drop-shadow-md' : 'text-gray-400'} transition-transform duration-500`}>
      {valB}
    </div>
  </div>
);

export default MovieComparator;
