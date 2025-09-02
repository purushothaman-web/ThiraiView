import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  const [sort, setSort] = useState('title_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // === Restore state from URL on initial load ===
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('query') || '';
    const s = params.get('sort') || 'title_asc';
    const p = parseInt(params.get('page')) || 1;
    const l = parseInt(params.get('limit')) || 10;

    setSearchTerm(q);
    setSort(s);
    setPage(p);
    setLimit(l);
    fetchSearchedMovies(q, s, p, l);
  }, []);

  // === Fetch autocomplete ===
  const fetchAutocomplete = async (query) => {
    if (!query) {
      setAutocompleteResults([]);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/movies/autocomplete?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Autocomplete fetch failed');
      const data = await res.json();
      setAutocompleteResults(data);
    } catch (err) {
      console.error('Autocomplete error:', err);
    }
  };

  // === Fetch search results with pagination ===
  const fetchSearchedMovies = async (query, sortValue, pageNum = 1, perPage = limit) => {
    setSearchLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${BASE_URL}/movies/search?query=${encodeURIComponent(query)}&sort=${sortValue}&page=${pageNum}&limit=${perPage}`
      );
      if (!res.ok) throw new Error('Search fetch failed');
      const data = await res.json();

      setMovies(data.movies);
      setTotalPages(data.totalPages);
      setTotalResults(data.total);
      setPage(data.page);
      setLimit(data.limit);
      setAutocompleteResults([]);

      // Sync URL
      const params = new URLSearchParams({ query, sort: sortValue, page: pageNum, limit: perPage });
      window.history.replaceState(null, '', `?${params.toString()}`);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchAutocomplete(value);
  };

  const handleAutocompleteClick = (title) => {
    setSearchTerm(title);
    fetchSearchedMovies(title, sort, 1, limit);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSearchedMovies(searchTerm, sort, 1, limit);
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSort(selectedSort);
    fetchSearchedMovies(searchTerm, selectedSort, 1, limit);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setLimit(newLimit);
    fetchSearchedMovies(searchTerm, sort, 1, newLimit);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchSearchedMovies(searchTerm, sort, newPage, limit);
    }
  };

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">🎬 Movie Library</h1>

      <form onSubmit={handleSearchSubmit} className="mb-6 relative max-w-md mx-auto flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search movies by title or director..."
          className="flex-grow border border-gray-300 rounded px-4 py-2"
        />

        <select
          value={sort}
          onChange={handleSortChange}
          className="border border-gray-300 rounded px-3 py-2"
          aria-label="Sort movies"
        >
          <option value="title_asc">Title ↑</option>
          <option value="title_desc">Title ↓</option>
          <option value="year_asc">Year ↑</option>
          <option value="year_desc">Year ↓</option>
          <option value="rating_asc">Rating ↑</option>
          <option value="rating_desc">Rating ↓</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Search movies"
        >
          Search
        </button>

        {/* Autocomplete dropdown */}
        {autocompleteResults.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-12 max-h-48 overflow-auto rounded shadow max-w-md mx-auto left-0 right-0">
            {autocompleteResults.map((movie) => (
              <li
                key={movie.id}
                onClick={() => handleAutocompleteClick(movie.title)}
                className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              >
                {movie.title}
              </li>
            ))}
          </ul>
        )}
      </form>

      {searchLoading && <div className="text-center mb-4">Searching...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {movies.length === 0 && <p className="text-center col-span-full">No movies found.</p>}

        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            director={movie.director}
            year={movie.year}
            avgRating={movie.avgRating}
            poster={movie.poster}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
          <div>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalResults)} of {totalResults} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    pageNum === page ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div>
            <label className="mr-2">Limit:</label>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
