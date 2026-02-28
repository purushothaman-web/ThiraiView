import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/axiosInstance';

const MovieRow = ({ title, type, fetchUrl }) => {
  const [movies, setMovies] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    <div className="py-10 space-y-6 px-4 md:px-12 group relative z-10">
      <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2 pl-2 tracking-wide uppercase flex items-center gap-3">
        <span className="w-1.5 h-8 bg-brand-yellow rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></span>
        {title}
      </h2>
      
      <div className="relative group/slider">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-8 z-30 bg-gradient-to-r from-black via-black/80 to-transparent w-20 hidden group-hover/slider:flex items-center justify-start pl-4 transition-all opacity-0 group-hover/slider:opacity-100"
        >
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-brand-yellow hover:text-black transition-colors">
             <ChevronLeft size={28} />
          </div>
        </button>

        {/* Scroll Container */}
        <div 
          ref={rowRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide py-8 px-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.sourceId}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex-none"
            >
              <Link
                to={`/movies/${movie.sourceId}`}
                className="block w-[160px] md:w-[220px] relative group/card outline-none"
              >
                {/* Glow Backdrop */}
                <div className="absolute inset-0 bg-brand-yellow/0 group-hover/card:bg-brand-yellow/20 rounded-xl blur-xl transition-all duration-500 transform group-hover/card:scale-110 -z-10"></div>
                
                {/* Card Container */}
                <motion.div 
                  whileHover={{ y: -10, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-xl overflow-hidden bg-[#111] relative aspect-[2/3] border border-white/5 shadow-2xl"
                >
                  <img
                    src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : "/placeholder.png"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-4">
                     <p className="text-white font-display font-medium text-lg leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                        {movie.title}
                     </p>
                  </div>
                </motion.div>
                
                {/* Title Below (Default visible) */}
                <div className="mt-4 text-sm md:text-base text-gray-400 font-medium truncate group-hover/card:text-brand-yellow transition-colors font-display tracking-wide px-1">
                  {movie.title}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-8 z-30 bg-gradient-to-l from-black via-black/80 to-transparent w-20 hidden group-hover/slider:flex items-center justify-end pr-4 transition-all opacity-0 group-hover/slider:opacity-100"
        >
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-brand-yellow hover:text-black transition-colors">
            <ChevronRight size={28} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
