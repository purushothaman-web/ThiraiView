import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../api/axiosInstance";
import { Star, Clock, Calendar, ArrowLeft, Loader, Play, Activity, Share2, Heart, Video } from "lucide-react";
import TrailerModal from "../components/TrailerModal";
import CastList from "../components/CastList";
import RadarChart from "../components/RadarChart";

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
      try {
        const res = await apiClient.get(`/catalog/movies/${sourceId}`);
        setMovie(res.data);
        
        // Extract trailer
        if (res.data.videos && res.data.videos.results) {
          const trailer = res.data.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");
          if (trailer) setTrailerKey(trailer.key);
        }

        // Fetch DNA in parallel or after
        const dnaRes = await apiClient.get(`/catalog/dna/${sourceId}`);
        setDna(dnaRes.data);
      } catch {
        setError("Failed to load movie details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    // Scroll to top on mount/change
    window.scrollTo(0, 0);
  }, [sourceId]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-brand-black"><Loader className="animate-spin text-brand-yellow" size={40} /></div>;
  if (error) return <div className="text-center py-20 text-red-500 bg-brand-black min-h-screen">{error}</div>;
  if (!movie) return <div className="text-center py-20 bg-brand-black min-h-screen text-white">Movie not found</div>;

  const backdropUrl = movie.backdropPath 
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  return (
    <div className="bg-brand-black min-h-screen text-white pb-20 animate-fade-in">
      
      <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} videoKey={trailerKey} />

      {/* Hero Header with Backdrop */}
      <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[650px] overflow-hidden">
         {backdropUrl ? (
           <>
             <img src={backdropUrl} alt="" className="w-full h-full object-cover animate-scale-slow" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-brand-black/90 via-brand-black/40 to-transparent"></div>
           </>
         ) : (
            <div className="w-full h-full bg-brand-gray"></div>
         )}

         {/* Content container overlapping hero */}
         <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-12 z-20 flex flex-col md:flex-row gap-8 md:items-end">
            
            {/* Poster - Floating */}
            <div className="hidden md:block w-72 shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-brand-black/50 relative -mb-20 z-30 group animate-slide-up">
               <img 
                 src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder-poster.png"} 
                 alt={movie.title} 
                 className="w-full h-auto"
               />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <button className="p-3 bg-brand-yellow text-brand-black rounded-full hover:scale-110 transition-transform"><Heart fill="currentColor" size={24}/></button>
                  <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"><Share2 size={24}/></button>
               </div>
            </div>

            {/* Mobile Poster (small) */}
            <div className="md:hidden w-32 rounded-lg overflow-hidden shadow-xl border-2 border-white/10 animate-slide-up">
               <img 
                 src={movie.posterPath ? `https://image.tmdb.org/t/p/w200${movie.posterPath}` : "/placeholder-poster.png"} 
                 alt={movie.title} 
                 className="w-full h-auto"
               />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 max-w-4xl animate-slide-up delay-100">
               <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
                 {movie.title} 
                 <span className="text-gray-400 text-2xl md:text-4xl font-bold ml-3">({movie.releaseDate?.split("-")[0]})</span>
               </h1>
               
               {movie.tagline && <p className="text-xl text-brand-yellow italic font-medium drop-shadow-md">"{movie.tagline}"</p>}

               <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base font-medium text-gray-300">
                  <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                     <Star className="text-brand-yellow fill-brand-yellow" size={18} /> 
                     <span className="text-white font-bold text-lg">{movie.voteAverage?.toFixed(1)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                     <Clock size={18} className="text-gray-400" /> {movie.runtime} min
                  </span>
                  <div className="flex flex-wrap gap-2">
                     {movie.genres?.map(g => (
                       <span key={g.id} className="px-3 py-1 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
                         {g.name}
                       </span>
                     ))}
                  </div>
               </div>
               
               {/* Action Buttons */}
               <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsTrailerOpen(true)}
                    disabled={!trailerKey}
                    className={`px-8 py-3 rounded-xl font-black text-lg flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.3)] ${
                      trailerKey 
                      ? "bg-brand-yellow text-brand-black hover:bg-yellow-400" 
                      : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                     <Play fill="currentColor" size={20} /> {trailerKey ? "Play Trailer" : "No Trailer"}
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-24 md:mt-32 grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in delay-200">
        
        {/* Left Column: Overview & DNA */}
        <div className="lg:col-span-2 space-y-12">
           
           <section>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 border-l-4 border-brand-yellow pl-3">
                Storyline
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                 {movie.overview}
              </p>
           </section>

           {/* Cast List */}
           <CastList cast={movie.cast} />



           {/* DNA Analysis */}
           {dna && (
              <section className="bg-brand-gray rounded-3xl p-8 border border-gray-800 shadow-xl overflow-hidden relative group hover:border-brand-yellow/30 transition-colors duration-500">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] group-hover:bg-brand-yellow/10 transition-colors duration-500"></div>
                 <div className="relative z-10">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                     <Activity className="text-brand-yellow" /> Cinematic DNA Analysis
                   </h3>
                   
                   <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      {/* Radar Chart */}
                      <div className="shrink-0">
                        <RadarChart data={dna.vector} size={300} />
                      </div>

                      {/* Text Breakdown */}
                      <div className="flex-1 space-y-4 w-full">
                        <p className="text-gray-400 text-sm italic mb-4">
                          This movie's unique fingerprint based on its genres, pace, and mood.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(dna.vector).sort((a,b) => b[1] - a[1]).map(([trait, value]) => (
                            <div key={trait} className="bg-black/40 p-3 rounded-lg border border-white/5 flex justify-between items-center group/item hover:border-brand-yellow/30 transition-colors">
                               <span className="text-sm font-bold text-gray-300 capitalize">{trait}</span>
                               <span className="text-brand-yellow font-mono font-bold">{(value * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                 </div>
              </section>
           )}

        </div>

        {/* Right Column: Providers & Similar */}
        <div className="space-y-12">
            
            {/* Providers */}
            {movie.providers?.results?.IN?.flatrate && (
               <section className="bg-brand-gray/50 p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Streaming On</h3>
                  <div className="flex flex-wrap gap-4">
                    {movie.providers.results.IN.flatrate.map(p => (
                      <img key={p.provider_id} src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-12 h-12 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer" title={p.provider_name} />
                    ))}
                  </div>
               </section>
            )}

            {/* Similar Vibe */}
            {dna && (
              <section>
                 <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">More Like This</h3>
                 <div className="space-y-4">
                   {dna.similar?.slice(0, 5).map(sim => (
                     <Link to={`/movies/${sim.sourceId}`} key={sim.sourceId} className="flex gap-4 items-center group p-2 rounded-xl hover:bg-brand-gray transition-colors border border-transparent hover:border-gray-800">
                        <div className="w-16 h-24 shrink-0 overflow-hidden rounded-lg shadow-md bg-gray-800 relative">
                           <img src={`https://image.tmdb.org/t/p/w92${sim.posterPath}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-gray-200 group-hover:text-brand-yellow transition-colors truncate">{sim.title}</h4>
                           <p className="text-xs text-gray-500 mt-1">{sim.releaseDate?.split("-")[0]}</p>
                           <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-400">
                              <Activity size={12} /> {((sim.similarity || 0.85) * 100).toFixed(0)}% Match
                           </div>
                        </div>
                     </Link>
                   ))}
                   {(!dna.similar || dna.similar.length === 0) && <p className="text-gray-500 italic">No similar vibes found.</p>}
                 </div>
              </section>
            )}
        </div>

      </div>
    </div>
  );
};

export default MovieDetail;
