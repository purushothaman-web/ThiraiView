import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Clock, Loader, ThumbsUp, AlertCircle, Play } from "lucide-react";
import { Link } from "react-router-dom";

const TimeSlotPicker = () => {
  const [minutes, setMinutes] = useState(120);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    setHasSearched(true);
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
    <div className="bg-brand-black min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">
            Time <span className="text-brand-yellow">Slot</span> Picker
          </h1>
          <p className="text-gray-400 text-lg">Tell us how much time you have, and we'll fill it perfectly.</p>
        </div>

        <div className="bg-brand-gray p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-800 max-w-3xl mx-auto mb-16 relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
             <div className="text-6xl md:text-8xl font-black text-white mb-2 tabular-nums tracking-tighter">
               {formatHours(minutes)}
             </div>
             <p className="text-brand-yellow font-bold uppercase tracking-widest text-sm mb-10">Available Time</p>
             
             <div className="relative mb-12 px-4">
               <input
                type="range"
                min="60"
                max="240"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-yellow hover:accent-yellow-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
               />
               <div className="flex justify-between text-xs font-bold text-gray-500 mt-4 uppercase tracking-wider">
                 <span>Short (1h)</span>
                 <span>Standard (2h)</span>
                 <span>Epic (3h+)</span>
               </div>
             </div>

             <button 
               onClick={fetchMovies}
               disabled={loading}
               className="bg-brand-yellow hover:bg-yellow-400 text-brand-black text-xl font-black py-4 px-12 rounded-xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
             >
               {loading ? <Loader className="animate-spin" /> : <> <Clock /> FIND MOVIES </>}
             </button>
          </div>
        </div>

        {hasSearched && (
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white border-l-4 border-brand-yellow pl-4">
              Perfect Fits <span className="text-gray-500 text-lg font-normal ml-2">({movies.length} found)</span>
            </h2>
            
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((movie) => (
                  <Link 
                    key={movie.sourceId} 
                    to={`/movies/${movie.sourceId}`}
                    className="group relative bg-brand-gray rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-brand-yellow/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <div className="aspect-[2/3] overflow-hidden relative">
                      <img 
                        src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.png"} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                        {movie.runtime}m
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white line-clamp-1 group-hover:text-brand-yellow transition-colors">{movie.title}</h3>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-1 font-medium">
                        <span>{movie.releaseDate?.split('-')[0]}</span>
                        <span className="text-brand-yellow flex items-center gap-1"><ThumbsUp size={12} /> {movie.voteAverage?.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-20 bg-brand-gray rounded-3xl border border-gray-800 border-dashed">
                  <Clock className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-xl font-medium">No direct matches found.</p>
                  <p className="text-gray-500 mt-2">Try adjusting your time slightly!</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotPicker;
