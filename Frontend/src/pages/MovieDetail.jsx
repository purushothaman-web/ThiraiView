import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/axiosInstance";
import { Star, Clock, Calendar, ArrowLeft, Loader, Play, Activity, Share2, Heart, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TrailerModal from "../components/TrailerModal";
import CastList from "../components/CastList";
import RadarChart from "../components/RadarChart";

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  out: { opacity: 0, transition: { duration: 0.4, ease: "easeIn" } }
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const MovieDetail = () => {
  const { sourceId } = useParams();
  const [movie, setMovie] = useState(null);
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/catalog/movies/${sourceId}`);
        setMovie(res.data);
        
        // Extract trailer
        if (res.data.videos && res.data.videos.results) {
          const trailer = res.data.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");
          if (trailer) setTrailerKey(trailer.key);
        }

        // Fetch DNA in parallel or after
        apiClient.get(`/catalog/dna/${sourceId}`)
          .then(dnaRes => setDna(dnaRes.data))
          .catch(e => console.log("DNA not found", e));

      } catch {
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [sourceId]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#050505] relative z-20">
      <Loader className="animate-spin text-brand-yellow drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" size={48} />
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-[#050505] relative z-20">
      <div className="text-center bg-white/5 p-12 rounded-3xl border border-white/10 backdrop-blur-md">
        <Activity className="mx-auto text-brand-yellow mb-6" size={48} />
        <p className="text-white font-display text-2xl mb-4">{error}</p>
        <Link to="/" className="text-brand-yellow hover:text-white transition-colors font-display tracking-widest uppercase text-sm">Return Home</Link>
      </div>
    </div>
  );
  
  if (!movie) return null;

  const backdropUrl = movie.backdropPath 
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="bg-[#050505] min-h-screen text-white pb-20 relative"
    >
      <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} videoKey={trailerKey} />

      {/* Hero Header with Backdrop */}
      <div className="relative w-full h-[70vh] md:h-[85vh] min-h-[600px] overflow-hidden bg-brand-black">
         {backdropUrl ? (
           <motion.div 
             initial={{ scale: 1.1, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="absolute inset-0 w-full h-full"
           >
             <img src={backdropUrl} alt="" className="w-full h-full object-cover origin-center" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent"></div>
           </motion.div>
         ) : (
            <div className="w-full h-full bg-[#111]"></div>
         )}

         {/* Content container overlapping hero */}
         <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 lg:px-20 pb-12 md:pb-16 z-20 flex flex-col md:flex-row gap-8 md:gap-12 md:items-end max-w-[1600px] mx-auto">
            
            {/* Poster - Floating */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="hidden md:block w-72 lg:w-80 shrink-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative -mb-24 z-30 group"
            >
               <img 
                 src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder-poster.png"} 
                 alt={movie.title} 
                 className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 backdrop-blur-sm">
                  <button className="p-4 bg-white/10 text-white border border-white/20 rounded-full hover:bg-brand-yellow hover:text-[#050505] hover:border-brand-yellow transition-all transform hover:scale-110 shadow-lg"><Heart size={24}/></button>
                  <button className="p-4 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white hover:text-[#050505] transition-all transform hover:scale-110 shadow-lg"><Share2 size={24}/></button>
               </div>
            </motion.div>

            {/* Mobile Poster (small) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="md:hidden w-32 rounded-xl overflow-hidden shadow-2xl border border-white/10"
            >
               <img 
                 src={movie.posterPath ? `https://image.tmdb.org/t/p/w200${movie.posterPath}` : "/placeholder-poster.png"} 
                 alt={movie.title} 
                 className="w-full h-auto"
               />
            </motion.div>

            {/* Info */}
            <motion.div 
              variants={contentVariants}
              initial="hidden"
              animate="show"
              className="flex-1 space-y-5 max-w-4xl"
            >
               <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.1] tracking-wide text-white drop-shadow-2xl">
                 {movie.title} 
                 <span className="text-gray-400 font-light text-3xl md:text-5xl ml-3 tracking-normal">({movie.releaseDate?.split("-")[0]})</span>
               </motion.h1>
               
               {movie.tagline && (
                 <motion.p variants={itemVariants} className="text-xl md:text-2xl text-brand-yellow font-display font-light italic tracking-wide drop-shadow-md">
                   "{movie.tagline}"
                 </motion.p>
               )}

               <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base font-display font-medium text-gray-300 uppercase tracking-widest pt-2">
                  <span className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner text-white">
                     <Star className="text-brand-yellow fill-brand-yellow" size={18} /> 
                     <span className="font-bold text-lg">{movie.voteAverage?.toFixed(1)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                     <Clock size={18} className="text-brand-yellow" /> {movie.runtime} min
                  </span>
                  <div className="flex flex-wrap gap-2">
                     {movie.genres?.map(g => (
                       <span key={g.id} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-full text-xs font-bold tracking-[0.2em]">
                         {g.name}
                       </span>
                     ))}
                  </div>
               </motion.div>
               
               {/* Action Buttons */}
               <motion.div variants={itemVariants} className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setIsTrailerOpen(true)}
                    disabled={!trailerKey}
                    className={`px-8 py-4 rounded-full font-display font-bold text-lg flex items-center gap-3 transition-all tracking-widest uppercase ${
                      trailerKey 
                      ? "bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transform hover:scale-105" 
                      : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                    }`}
                  >
                     <Play fill="currentColor" size={20} /> {trailerKey ? "Watch Trailer" : "No Trailer"}
                  </button>
               </motion.div>
            </motion.div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 mt-28 md:mt-40 grid grid-cols-1 xl:grid-cols-3 gap-16 md:gap-24 relative z-20">
        
        {/* Left Column: Overview & DNA */}
        <div className="xl:col-span-2 space-y-16">
           
           <motion.section 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.6 }}
           >
              <h3 className="text-2xl font-display font-medium text-white mb-6 flex items-center gap-3 border-l-4 border-brand-yellow pl-4 uppercase tracking-widest">
                The Synopsis
              </h3>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light md:pr-10">
                 {movie.overview}
              </p>
           </motion.section>

           {/* Cast List */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.6 }}
           >
             <h3 className="text-2xl font-display font-medium text-white mb-6 flex items-center gap-3 border-l-4 border-brand-yellow pl-4 uppercase tracking-widest">
                Top Billed Cast
              </h3>
             <CastList cast={movie.cast} />
           </motion.div>


           {/* DNA Analysis */}
           {dna && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
                className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl overflow-hidden relative group hover:border-white/20 transition-colors duration-500 backdrop-blur-xl"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-[100px] group-hover:bg-brand-yellow/10 transition-colors duration-700 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h3 className="text-2xl font-display font-medium text-white mb-8 flex items-center gap-3 tracking-widest uppercase">
                     <Activity className="text-brand-yellow" size={28} /> Cinematic DNA
                   </h3>
                   
                   <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">
                      {/* Radar Chart */}
                      <div className="shrink-0 drop-shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <RadarChart data={dna.vector} size={320} />
                      </div>

                      {/* Text Breakdown */}
                      <div className="flex-1 space-y-6 w-full">
                        <p className="text-gray-400 font-display font-light text-lg italic border-l-2 border-white/20 pl-4">
                          This film's unique emotional and thematic fingerprint.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(dna.vector).sort((a,b) => b[1] - a[1]).map(([trait, value], idx) => (
                            <motion.div 
                               initial={{ opacity: 0, x: -10 }}
                               whileInView={{ opacity: 1, x: 0 }}
                               viewport={{ once: true }}
                               transition={{ delay: 0.1 * idx }}
                               key={trait} 
                               className="bg-black/60 p-4 rounded-xl border border-white/5 flex justify-between items-center group/item hover:border-brand-yellow/40 transition-colors shadow-inner"
                            >
                               <span className="text-sm font-display font-medium text-gray-300 uppercase tracking-widest">{trait}</span>
                               <span className="text-brand-yellow font-display font-bold text-lg">{(value * 100).toFixed(0)}%</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                   </div>
                 </div>
              </motion.section>
           )}

        </div>

        {/* Right Column: Providers & Similar */}
        <div className="space-y-16">
            
            {/* Providers */}
            {movie.providers?.results?.IN?.flatrate && (
               <motion.section 
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md"
               >
                  <h3 className="text-sm font-display font-bold text-gray-400 mb-6 uppercase tracking-[0.2em]">Available To Stream</h3>
                  <div className="flex flex-wrap gap-4">
                    {movie.providers.results.IN.flatrate.map(p => (
                      <img key={p.provider_id} src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-16 h-16 rounded-2xl shadow-lg border border-white/10 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all cursor-pointer" title={p.provider_name} />
                    ))}
                  </div>
               </motion.section>
            )}

            {/* Similar Vibe */}
            {dna && (
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                 <h3 className="text-xl font-display font-medium text-white mb-8 border-b border-white/10 pb-4 uppercase tracking-widest">More Like This</h3>
                 <div className="space-y-5">
                   {dna.similar?.slice(0, 5).map((sim, idx) => (
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: idx * 0.1 }}
                     >
                       <Link to={`/movies/${sim.sourceId}`} key={sim.sourceId} className="flex gap-5 items-center group p-3 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                          <div className="w-20 h-28 shrink-0 overflow-hidden rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] bg-[#111] relative">
                             <img src={`https://image.tmdb.org/t/p/w92${sim.posterPath}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-display font-medium text-lg text-white group-hover:text-brand-yellow transition-colors truncate tracking-wide">{sim.title}</h4>
                             <p className="text-sm font-display text-gray-500 mt-1 tracking-widest">{sim.releaseDate?.split("-")[0]}</p>
                             <div className="flex items-center gap-1.5 mt-3 text-xs font-display font-bold uppercase tracking-widest text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20 inline-flex px-2 py-1 rounded-md">
                                <Activity size={14} /> {((sim.similarity || 0.85) * 100).toFixed(0)}% Match
                             </div>
                          </div>
                       </Link>
                     </motion.div>
                   ))}
                   {(!dna.similar || dna.similar.length === 0) && <p className="text-gray-500 italic font-display">No similar vibes found.</p>}
                 </div>
              </motion.section>
            )}
        </div>

      </div>
    </motion.div>
  );
};

export default MovieDetail;
