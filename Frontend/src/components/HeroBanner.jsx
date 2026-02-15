import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';

const HeroBanner = ({ movie }) => {
  if (!movie) return null;

  const backdropUrl = movie.backdropPath 
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  return (
    <div className="relative w-full overflow-hidden h-screen min-h-[650px] flex items-center bg-brand-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {backdropUrl && (
          <img 
            src={backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
        )}
        {/* Gradient Overlay - Netflix Style */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-4 md:px-12 py-32 md:py-20 flex flex-col justify-center max-w-7xl h-full">
        <div className="max-w-3xl space-y-6 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-lg leading-[1.1] md:leading-tight">
            {movie.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-200 text-sm md:text-base font-medium">
            <span className="text-brand-yellow font-bold flex items-center gap-1 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
              ⭐ {movie.voteAverage?.toFixed(1)}
            </span>
            <span className="bg-black/30 px-2 py-1 rounded backdrop-blur-sm">{movie.releaseDate?.split('-')[0]}</span>
            {movie.adult && <span className="border border-gray-400 px-2 py-1 rounded text-xs bg-black/30 backdrop-blur-sm">18+</span>}
          </div>

          <p className="text-sm md:text-lg text-gray-300 line-clamp-3 md:line-clamp-4 drop-shadow-md max-w-xl md:max-w-2xl leading-relaxed">
            {movie.overview}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6">
            <Link 
              to={`/movies/${movie.sourceId}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-yellow text-brand-black px-8 py-3.5 rounded-xl hover:bg-yellow-400 transition-all font-bold text-base md:text-lg shadow-lg shadow-yellow-500/20 transform hover:scale-105"
            >
              <Play fill="currentColor" size={20} /> Play Now
            </Link>
            <Link 
              to={`/movies/${movie.sourceId}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-800/60 backdrop-blur-md text-white px-8 py-3.5 rounded-xl hover:bg-gray-700/80 transition-all font-bold text-base md:text-lg border border-white/10 hover:border-white/30"
            >
              <Info size={24} /> More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
