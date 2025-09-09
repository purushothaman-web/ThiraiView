// src/pages/Home.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Card, { CardBody } from "../components/ui/Card";
import { AuthContext } from "../context/AuthContext";
import { MovieCardSkeleton, ListSkeleton } from "../components/ui/Skeleton";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { apiClient, user } = useContext(AuthContext);

  // Slider images (auto-load from assets/slider)
  const slides = useMemo(() => {
    const modules = import.meta.glob("../assets/slider/*", { eager: true, as: "url" });
    return Object.values(modules).slice(0, 3);
  }, []);
  const quotes = [
    "Discover stories that stay with you.",
    "Every frame tells a tale.",
    "Find your next favorite movie.",
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    if (!slides.length) return;
    const id = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  // === Fetch movies whenever query params change ===
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    const page = parseInt(params.get("page")) || 1;
    const limit = 9;

    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams({ query, page: String(page), limit: String(limit) });
        const response = await apiClient.get(`/movies/search?${qs.toString()}`);
        
        setMovies(response.data.movies);
        setTotalPages(response.data.totalPages);
        setTotalResults(response.data.total);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent rapid-fire requests
    const timeoutId = setTimeout(fetchMovies, 100);
    return () => clearTimeout(timeoutId);
  }, [location.search, apiClient]);

  // === Handlers ===
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(location.search);
    params.set("page", newPage);
    navigate(`/?${params.toString()}`);
  };

  const currentPage = parseInt(new URLSearchParams(location.search).get("page")) || 1;
  const windowPages = (() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 1) return [1, 2, 3];
    if (currentPage >= totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  })();

  // === UI ===
  if (loading) return <div className="text-center mt-10 text-gray-900 dark:text-gray-100">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600 dark:text-red-400">{error}</div>;

  return (
    <div className="px-4 md:px-6 max-w-7xl mx-auto">
      <div className="mt-2 mb-6">
        <Card>
          <CardBody>
            {/* Hero slider */}
            <div className="relative overflow-hidden rounded-lg max-h-56 md:max-h-64">
              {slides.length > 0 && (
                <img src={slides[activeSlide]} alt="Slide" className="w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-3 text-center">
                <span className="inline-block bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-lg text-sm backdrop-blur-sm">{quotes[activeSlide % quotes.length]}</span>
              </div>
              <div className="absolute right-3 bottom-3 flex gap-2">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)} className={`h-2 w-2 rounded-full transition-colors duration-200 ${i === activeSlide ? "bg-blue-600 dark:bg-blue-400" : "bg-gray-400/50 dark:bg-gray-600/50"}`} aria-label={`Go to slide ${i+1}`} />
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {loading ? (
        <ListSkeleton count={6} ItemComponent={MovieCardSkeleton} />
      ) : movies.length === 0 ? (
        <Card><CardBody><p className="text-center text-gray-600 dark:text-gray-400">No movies found.</p></CardBody></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} {...movie} medium />
          ))}
        </div>
      )}

      {totalResults > 0 && (
        <div className="flex items-center justify-center mt-8 gap-2">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1} 
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Prev
          </button>
          {windowPages.map((p) => (
            <button 
              key={p} 
              onClick={() => handlePageChange(p)} 
              className={`px-3 py-1 rounded-lg border transition-colors duration-200 ${
                p === currentPage 
                  ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {p}
            </button>
          ))}
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages} 
            className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
