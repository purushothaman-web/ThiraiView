import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/axiosInstance";
import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import { Loader } from "lucide-react";

const Home = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");

  // Fetch Hero Banner Movie (Random Trending)
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await apiClient.get('/catalog/collection/trending');
        const movies = res.data;
        if (movies?.length > 0) {
          const random = movies[Math.floor(Math.random() * Math.min(5, movies.length))];
           // Get full details for the banner (logo, backdrop)
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
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    if (!query) return;
    const search = async () => {
      const res = await apiClient.get(`/catalog/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.results || []);
    };
    search();
  }, [query]);


  if (query) {
    return (
      <div className="bg-brand-black min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Search Results: <span className="text-brand-yellow">"{query}"</span></h1>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {searchResults.map(m => (
               <a href={`/movies/${m.sourceId}`} key={m.sourceId} className="group">
                 <div className="rounded-lg overflow-hidden bg-brand-gray aspect-[2/3] mb-2 border border-gray-800 group-hover:border-brand-yellow/50 transition-colors">
                   <img src={m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : "/placeholder.png"} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <h3 className="text-white font-medium truncate group-hover:text-brand-yellow transition-colors">{m.title}</h3>
                 <p className="text-sm text-gray-500">{m.releaseDate?.split('-')[0]}</p>
               </a>
            ))}
            {searchResults.length === 0 && <p className="text-gray-400 text-lg">No results found.</p>}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-brand-yellow" size={40} /></div>;

  return (
    <div className="bg-brand-black min-h-screen pb-20">
      <HeroBanner movie={featuredMovie} />
      
      <div className="relative z-20 pb-20 space-y-8 -mt-10 md:-mt-20 lg:-mt-32 pl-4 md:pl-12">
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
    </div>
  );
};

export default Home;
