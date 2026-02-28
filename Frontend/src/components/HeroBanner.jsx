import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroBanner = ({ movie }) => {
  if (!movie) return null;

  const backdropUrl = movie.backdropPath 
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null;

  // Stagger variants for the text content
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative w-full overflow-hidden h-screen min-h-[700px] md:min-h-[850px] flex items-center bg-[#050505]">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        {backdropUrl && (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 15, ease: "linear" }}
            src={backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-4 md:px-12 py-32 md:py-20 flex flex-col justify-end md:justify-center h-full">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl space-y-6 pb-20 md:pb-28 lg:pb-32 mt-16 md:mt-0"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] leading-[1.1] md:leading-[1.05]"
          >
            {movie.title}
          </motion.h1>
          
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 text-gray-200 text-sm md:text-base font-medium font-display tracking-widest uppercase">
            <span className="text-brand-yellow font-bold flex items-center gap-1 bg-brand-yellow/10 px-3 py-1.5 rounded-sm border border-brand-yellow/20 backdrop-blur-md">
              <span className="text-lg">★</span> {movie.voteAverage?.toFixed(1)}
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm backdrop-blur-md">{movie.releaseDate?.split('-')[0]}</span>
            {movie.adult && <span className="border border-white/20 px-3 py-1.5 rounded-sm text-xs bg-red-900/40 text-red-100 backdrop-blur-md">18+</span>}
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-base md:text-xl text-gray-300 line-clamp-3 drop-shadow-xl max-w-2xl leading-relaxed font-light"
          >
            {movie.overview}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-8">
            <Link 
              to={`/movies/${movie.sourceId}`}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full hover:bg-gray-200 transition-colors font-display font-medium text-base md:text-lg"
            >
              <Play fill="currentColor" size={22} className="ml-1" /> Play Now
            </Link>
            <Link 
              to={`/movies/${movie.sourceId}`}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full hover:bg-white/20 transition-colors font-display font-medium text-base md:text-lg border border-white/10"
            >
              <Info size={24} /> More Info
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroBanner;
