import React, { useState } from "react";
import apiClient from "../api/axiosInstance";
import { Search, X, Scale } from "lucide-react";
import { Link } from "react-router-dom";

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
    const res = await apiClient.get(`/catalog/autocomplete?q=${q}`);
    setSuggestions(res.data);
  };

  const selectMovie = async (movie, side) => {
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
  };

  return (
    <div className="bg-brand-black min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">
            Movie <span className="text-brand-yellow">Comparator</span>
          </h1>
          <p className="text-gray-400 text-lg">See how they stack up side-by-side.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative mb-12">
          {/* Center VS Badge */}
          <div className="absolute left-1/2 top-10 -translate-x-1/2 z-10 hidden md:flex items-center justify-center pointer-events-none">
            <div className="bg-brand-black p-2 rounded-full shadow-2xl border-4 border-brand-gray">
              <div className="bg-brand-yellow text-brand-black font-black text-2xl w-14 h-14 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)]">VS</div>
            </div>
          </div>

          {/* Left Side */}
          <div className="bg-brand-gray p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-800 min-h-[400px] flex flex-col relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-400 text-xs font-bold px-4 py-1 rounded-full border border-gray-700 uppercase tracking-widest">Contender A</div>
             {!movieLeft ? (
               <div className="relative flex-1 flex flex-col justify-center">
                  <div className="mb-6 text-center">
                    <div className="w-20 h-20 bg-black/30 rounded-full mx-auto flex items-center justify-center mb-4 border border-white/5">
                      <Search className="text-gray-600" size={32} />
                    </div>
                    <h3 className="text-white font-bold text-xl">Select a Movie</h3>
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-yellow transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search title..."
                      className="w-full p-3 pl-12 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-all placeholder-gray-600"
                      value={searchLeft}
                      onChange={(e) => {
                        setSearchLeft(e.target.value);
                        search(e.target.value, setSuggestionsLeft);
                      }}
                    />
                    {suggestionsLeft.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-gray-900 shadow-2xl rounded-xl z-20 mt-2 max-h-60 overflow-y-auto border border-gray-700 scrollbar-thin scrollbar-thumb-gray-700">
                        {suggestionsLeft.map(m => (
                          <div key={m.sourceId} onClick={() => selectMovie(m, "left")} className="p-3 hover:bg-gray-800 cursor-pointer flex gap-3 items-center border-b border-gray-800 last:border-none transition-colors">
                            <img src={m.posterPath ? `https://image.tmdb.org/t/p/w92${m.posterPath}` : "/placeholder.png"} alt="" className="w-10 h-14 object-cover rounded bg-gray-800" />
                            <div>
                              <p className="font-bold text-sm text-gray-200">{m.title}</p>
                              <p className="text-xs text-brand-yellow">{m.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             ) : (
               <MovieCard movie={movieLeft} onRemove={() => setMovieLeft(null)} color="text-blue-400" />
             )}
          </div>

          {/* Right Side */}
          <div className="bg-brand-gray p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-800 min-h-[400px] flex flex-col relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-400 text-xs font-bold px-4 py-1 rounded-full border border-gray-700 uppercase tracking-widest">Contender B</div>
             {!movieRight ? (
               <div className="relative flex-1 flex flex-col justify-center">
                  <div className="mb-6 text-center">
                    <div className="w-20 h-20 bg-black/30 rounded-full mx-auto flex items-center justify-center mb-4 border border-white/5">
                      <Search className="text-gray-600" size={32} />
                    </div>
                    <h3 className="text-white font-bold text-xl">Select a Movie</h3>
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-brand-yellow transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search title..."
                      className="w-full p-3 pl-12 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow focus:outline-none transition-all placeholder-gray-600"
                      value={searchRight}
                      onChange={(e) => {
                        setSearchRight(e.target.value);
                        search(e.target.value, setSuggestionsRight);
                      }}
                    />
                    {suggestionsRight.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-gray-900 shadow-2xl rounded-xl z-20 mt-2 max-h-60 overflow-y-auto border border-gray-700 scrollbar-thin scrollbar-thumb-gray-700">
                        {suggestionsRight.map(m => (
                          <div key={m.sourceId} onClick={() => selectMovie(m, "right")} className="p-3 hover:bg-gray-800 cursor-pointer flex gap-3 items-center border-b border-gray-800 last:border-none transition-colors">
                            <img src={m.posterPath ? `https://image.tmdb.org/t/p/w92${m.posterPath}` : "/placeholder.png"} alt="" className="w-10 h-14 object-cover rounded bg-gray-800" />
                            <div>
                              <p className="font-bold text-sm text-gray-200">{m.title}</p>
                              <p className="text-xs text-brand-yellow">{m.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             ) : (
               <MovieCard movie={movieRight} onRemove={() => setMovieRight(null)} color="text-red-400" />
             )}
          </div>
        </div>

        {/* Comparison Table */}
        {movieLeft && movieRight && (
          <div className="mt-8 bg-brand-gray rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-fade-in-up">
            <div className="grid grid-cols-3 text-center p-6 bg-black/40 font-black text-lg border-b border-gray-800">
              <div className="text-white truncate px-2">{movieLeft.title}</div>
              <div className="text-gray-500 uppercase text-xs tracking-widest self-center">VS</div>
              <div className="text-white truncate px-2">{movieRight.title}</div>
            </div>
            
            <div className="divide-y divide-gray-800/50">
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
                 winner={null}
              />
              <CompareRow 
                 label="Genres" 
                 valA={movieLeft.genres?.slice(0,2).map(g=>g.name).join(", ")} 
                 valB={movieRight.genres?.slice(0,2).map(g=>g.name).join(", ")} 
                 winner={null}
                 isText
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MovieCard = ({ movie, onRemove, color }) => (
  <div className="flex flex-col items-center text-center animate-fade-in-up h-full justify-center">
    <div className="relative w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl mb-6 group ring-4 ring-black/50 group-hover:ring-brand-yellow/50 transition-all duration-500 hover:scale-105">
      <img src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.png"} alt={movie.title} className="w-full h-full object-cover" />
      <button onClick={onRemove} className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors border border-white/10">
        <X size={16} />
      </button>
    </div>
    <h3 className="text-2xl font-black text-white mb-2 leading-tight">{movie.title}</h3>
    <p className={`text-sm font-bold uppercase tracking-wide opacity-80 ${color || 'text-brand-yellow'}`}>
      {movie.releaseDate?.split('-')[0]}
    </p>
  </div>
);

const CompareRow = ({ label, valA, valB, winner }) => (
  <div className="grid grid-cols-3 text-center py-5 hover:bg-white/5 transition-colors group">
    <div className={`flex items-center justify-center font-medium text-lg ${winner === 'left' ? 'text-brand-yellow font-bold scale-110' : 'text-gray-400'} transition-all`}>
      {valA}
    </div>
    <div className="text-xs text-gray-600 font-bold uppercase tracking-widest self-center group-hover:text-gray-400 transition-colors">{label}</div>
    <div className={`flex items-center justify-center font-medium text-lg ${winner === 'right' ? 'text-brand-yellow font-bold scale-110' : 'text-gray-400'} transition-all`}>
      {valB}
    </div>
  </div>
);

export default MovieComparator;
