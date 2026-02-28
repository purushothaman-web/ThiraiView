import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiClient from "../api/axiosInstance";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import { Loader } from "lucide-react";

// Variants for route transitions
const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  in: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, scale: 1.02, transition: { duration: 0.3, ease: "easeIn" } }
};

// Variants for search results stagging
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Home = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [searchResults, setSearchResults] = useState([]);

  // Fetch Hero Banner Movie (Random Trending)
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await apiClient.get('/catalog/collection/trending');
        const movies = res.data;
        if (movies?.length > 0) {
           const random = movies[Math.floor(Math.random() * Math.min(5, movies.length))];
           const detailRes = await apiClient.get(`/catalog/movies/${random.sourceId}`);
           setFeaturedMovie(detailRes.data);
        }
      } catch (err) {
        console.error("Hero fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    if (!query) fetchHero();
  }, [query]);

  // Search Results View
  useEffect(() => {
    if (!query) return;
    const search = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/catalog/search?q=${encodeURIComponent(query)}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
    };
    search();
  }, [query]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
      <Loader className="animate-spin text-brand-yellow drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" size={48} />
    </div>
  );

  if (query) {
    return (
      <motion.div 
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        className="bg-[#050505] min-h-screen pt-28 pb-12 px-4 md:px-12 relative z-10"
      >
        <div className="container mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-medium text-white mb-10 tracking-wide"
          >
            Search Results: <span className="text-brand-yellow">"{query}"</span>
          </motion.h1>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8"
          >
            {searchResults.map(m => (
               <motion.div variants={itemVariants} key={m.sourceId}>
                 <Link to={`/movies/${m.sourceId}`} className="group block relative">
                   <div className="rounded-xl overflow-hidden bg-[#111] aspect-[2/3] mb-3 border border-white/5 shadow-xl relative z-10">
                     <img 
                       src={m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : "/placeholder.png"} 
                       alt={m.title} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                     />
                     <div className="absolute inset-0 bg-brand-yellow/0 group-hover:bg-brand-yellow/10 transition-colors duration-300"></div>
                   </div>
                   {/* Background Glow */}
                   <div className="absolute inset-0 bg-brand-yellow/0 group-hover:bg-brand-yellow/20 translate-y-2 rounded-xl blur-xl transition-all duration-500 -z-0"></div>
                   
                   <h3 className="text-white font-display font-medium text-lg truncate group-hover:text-brand-yellow transition-colors relative z-10">{m.title}</h3>
                   <p className="text-sm text-gray-500 font-display relative z-10">{m.releaseDate?.split('-')[0] || 'Unknown'}</p>
                 </Link>
               </motion.div>
            ))}
            {searchResults.length === 0 && (
              <motion.p variants={itemVariants} className="text-gray-400 text-xl font-display col-span-full">
                No cinematic matches found. Try another title.
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="bg-[#050505] min-h-screen pb-20 relative"
    >
      <HeroBanner movie={featuredMovie} />
      
      <div className="relative z-20 pb-20 space-y-4 -mt-10 md:-mt-20 lg:-mt-32">
        <MovieRow title="Trending Now" rowID="trending" fetchUrl="/catalog/collection/trending" />
        <MovieRow title="Indian Blockbusters" rowID="indian" fetchUrl="/catalog/collection/indian" />
        <MovieRow title="Anime Favorites" rowID="anime" fetchUrl="/catalog/collection/anime" />
        <MovieRow title="Top Rated Classics" rowID="toprated" fetchUrl="/catalog/collection/top_rated" />
        <MovieRow title="Action Blockbusters" rowID="action" fetchUrl="/catalog/collection/action" />
        <MovieRow title="Comedy Hits" rowID="comedy" fetchUrl="/catalog/collection/comedy" />
        <MovieRow title="Brain-Twisting Sci-Fi" rowID="scifi" fetchUrl="/catalog/collection/scifi" />
        <MovieRow title="Chilling Horror" rowID="horror" fetchUrl="/catalog/collection/horror" />
        <MovieRow title="Coming Soon" rowID="upcoming" fetchUrl="/catalog/collection/upcoming" />
      </div>
    </motion.div>
  );
};

export default Home;
