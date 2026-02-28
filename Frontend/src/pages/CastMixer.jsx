import React, { useState, useEffect } from "react";
import apiClient from "../api/axiosInstance";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X, Users, Play, Loader, Plus } from "lucide-react";
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

const CastMixer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCast, setSelectedCast] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      fetchMovies(ids);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCast.length > 0) {
      const ids = selectedCast.map(c => c.id).join(",");
      fetchMovies(ids);
      setSearchParams({ ids });
    } else {
      setMovies([]);
      setSearchParams({});
    }
  }, [selectedCast, setSearchParams]);

  const searchActors = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length > 2) {
      try {
        const res = await apiClient.get(`/catalog/people/search`, { params: { q } });
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setResults([]);
    }
  };

  const addActor = (actor) => {
    if (!selectedCast.find(c => c.id === actor.id)) {
      setSelectedCast([...selectedCast, actor]);
    }
    setQuery("");
    setResults([]);
  };

  const removeActor = (id) => {
    setSelectedCast(selectedCast.filter(c => c.id !== id));
  };

  const fetchMovies = async (ids) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/catalog/discover/cast`, { params: { ids } });
      setMovies(res.data);
    } catch (err) {
      console.error(err);
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
            Cast <span className="text-brand-yellow font-bold">Mixer</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg md:text-xl font-light"
          >
            Select your favorite actors to uncover their shared cinematic universe.
          </motion.p>
        </div>

        {/* Caster Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 max-w-3xl mx-auto mb-20 relative overflow-visible"
        >
          {/* Subtle bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-brand-yellow/5 blur-[100px] pointer-events-none -z-10"></div>

          {/* Search Input */}
          <div className="relative mb-8 z-20">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input 
              type="text" 
              value={query}
              onChange={searchActors}
              placeholder="Search for an actor (e.g. Leonardo DiCaprio)..."
              className="w-full bg-black/60 border border-white/10 rounded-full py-5 pl-14 pr-6 text-white font-display text-lg placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all shadow-inner"
            />
            
            {/* Dropdown */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto w-full z-50 backdrop-blur-xl"
                >
                  {results.map(person => (
                    <button
                      key={person.id}
                      onClick={() => addActor(person)}
                      className="w-full text-left p-4 hover:bg-white/5 flex items-center gap-4 transition-colors border-b border-white/5 last:border-0"
                    >
                       {person.profilePath ? (
                         <img src={`https://image.tmdb.org/t/p/w45${person.profilePath}`} alt={person.name} className="w-12 h-12 rounded-full object-cover border border-white/10 shadow-md" />
                       ) : (
                         <div className="w-12 h-12 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400 font-display shadow-md">
                           {person.name.charAt(0)}
                         </div>
                       )}
                       <div>
                         <p className="font-display font-medium text-white text-lg tracking-wide">{person.name}</p>
                         <p className="text-sm text-gray-500 truncate w-64 md:w-80 font-display">{person.knownFor}</p>
                       </div>
                       <Plus size={20} className="ml-auto text-brand-yellow opacity-50 hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Pills */}
          <div className="flex flex-wrap gap-3 min-h-[60px] relative z-10 w-full">
            {selectedCast.length === 0 && (
              <p className="text-gray-500 font-display text-sm w-full text-center py-4 uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
                The stage is empty. Cast someone.
              </p>
            )}
            <AnimatePresence>
              {selectedCast.map(actor => (
                <motion.div 
                  key={actor.id} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/30 pl-2 pr-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.1)]"
                >
                   {actor.profilePath ? (
                     <img src={`https://image.tmdb.org/t/p/w45${actor.profilePath}`} alt="" className="w-8 h-8 rounded-full object-cover border border-brand-yellow/50" />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center border border-brand-yellow/50 text-xs font-bold font-display text-brand-yellow">
                       {actor.name.charAt(0)}
                     </div>
                   )}
                   <span className="text-brand-yellow font-display font-medium text-sm tracking-wide ml-1">{actor.name}</span>
                   <button 
                     onClick={() => removeActor(actor.id)} 
                     className="hover:bg-brand-yellow/30 p-1 rounded-full text-brand-yellow transition-colors ml-1"
                   >
                     <X size={14} />
                   </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {(selectedCast.length > 0 || loading) && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mt-12"
            >
              {movies.length > 0 && !loading && (
                <h2 className="text-2xl font-display font-medium text-white mb-8 pl-2 border-l-4 border-brand-yellow uppercase tracking-widest">
                  Shared Filmography
                </h2>
              )}

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
              </motion.div>
              
              {!loading && movies.length === 0 && selectedCast.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 mt-8"
                  >
                    <Users className="mx-auto h-20 w-20 text-gray-600 mb-6" />
                    <p className="text-gray-400 text-2xl font-display font-medium tracking-wide">No crossover films found.</p>
                    <p className="text-gray-500 mt-4 text-lg">These actors haven't shared the screen in our records.</p>
                 </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CastMixer;
