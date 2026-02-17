import React, { useState, useEffect } from "react";
import apiClient from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { X, Play, Loader, Filter, Info } from "lucide-react";
import { MovieCardSkeleton } from "../components/Skeleton";

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
      if (selectedGenres.length >= 3) {
        // Optional: limit to 3 genres to avoid empty results
        // For now let's allow more but maybe warn?
      }
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
    <div className="bg-brand-black min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">
            Genre <span className="text-brand-yellow">Blender</span>
          </h1>
          <p className="text-gray-400 text-lg">Mix genres to find the perfect crossover.</p>
        </div>

        {/* Blender Controls */}
        <div className="bg-brand-gray rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-800 max-w-4xl mx-auto mb-16 relative z-10">
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {genres.map((genre) => {
              const isSelected = selectedGenres.find((g) => g.id === genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 border ${
                    isSelected
                      ? "bg-brand-yellow text-brand-black border-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105"
                      : "bg-black/30 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>

          {/* Selected Summary */}
          {selectedGenres.length > 0 && (
             <div className="flex flex-col items-center mb-8 animate-fade-in">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                   <Filter size={14} />
                   <span>Blending:</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-2xl font-black text-white items-center">
                   {selectedGenres.map((g, i) => (
                      <React.Fragment key={g.id}>
                        {i > 0 && <span className="text-brand-yellow">+</span>}
                        <span>{g.name}</span>
                      </React.Fragment>
                   ))}
                </div>
             </div>
          )}

          <button
            onClick={fetchMovies}
            disabled={loading || selectedGenres.length === 0}
            className={`w-full py-4 rounded-xl font-black text-xl transition-all shadow-lg flex items-center justify-center gap-3 ${
               selectedGenres.length === 0
               ? "bg-gray-800 text-gray-500 cursor-not-allowed"
               : "bg-brand-yellow text-brand-black hover:bg-yellow-400 hover:scale-[1.02] shadow-yellow-500/20"
            }`}
          >
            {loading ? <Loader className="animate-spin" /> : "BLEND IT"}
          </button>
        </div>

        {/* Results */}
        {(hasSearched || loading) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up">
              {loading && Array(10).fill(0).map((_, i) => <MovieCardSkeleton key={i} />)}
              
              {!loading && movies.map((movie, index) => (
                <Link
                  key={movie.sourceId}
                  to={`/movies/${movie.sourceId}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="group relative bg-brand-gray rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-brand-yellow/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-900/10 fill-mode-both"
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

              {!loading && movies.length === 0 && (
                 <div className="col-span-full text-center py-20">
                    <Info className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-xl font-medium">No movies found blending these exact genres.</p>
                    <p className="text-gray-600 mt-2">Maybe try removing one genre?</p>
                 </div>
              )}
          </div>
        )}

      </div>
    </div>
  );
};

export default GenreBlender;
