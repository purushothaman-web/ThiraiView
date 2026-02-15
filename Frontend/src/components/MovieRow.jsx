import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '../api/axiosInstance';

const MovieRow = ({ title, type, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If fetchUrl is provided (custom), use it. Otherwise use the type for collection.
        const url = fetchUrl || `/catalog/collection/${type}`;
        const res = await apiClient.get(url);
        setMovies(res.data || []);
      } catch (err) {
        console.error(`Failed to fetch row ${title}`, err);
      }
    };
    fetchData();
  }, [type, fetchUrl, title]);

  const scroll = (direction) => {
    const { current } = rowRef;
    if (current) {
      const scrollAmount = direction === 'left' ? -current.clientWidth / 1.5 : current.clientWidth / 1.5;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="py-8 space-y-4 px-4 md:px-12 group">
      <h2 className="text-2xl font-bold text-white mb-2 border-l-4 border-brand-yellow pl-3">
        {title}
      </h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 bg-black/50 hover:bg-black/70 text-white w-12 hidden group-hover:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Scroll Container */}
        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <Link
              key={movie.sourceId}
              to={`/movies/${movie.sourceId}`}
              className="flex-none w-[160px] md:w-[200px] transition-transform duration-300 hover:scale-105 hover:z-10 origin-center"
            >
              <div className="rounded-lg overflow-hidden bg-brand-gray relative aspect-[2/3]">
                <img
                  src={movie.posterPath ? `https://image.tmdb.org/t/p/w300${movie.posterPath}` : "/placeholder.png"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-2 text-sm text-gray-400 font-medium truncate group-hover:text-brand-yellow transition-colors">
                {movie.title}
              </div>
            </Link>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 bg-black/50 hover:bg-black/70 text-white w-12 hidden group-hover:flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
