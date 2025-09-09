import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Input from "./ui/Input";
import Button from "./ui/Button";
import logo from "../assets/logo.png";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // === Fetch autocomplete results ===
  const fetchAutocomplete = async (query) => {
    if (!query) {
      setAutocompleteResults([]);
      return;
    }
    try {
      const res = await fetch(
        `${BASE_URL}/movies/autocomplete?query=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Autocomplete fetch failed");
      const data = await res.json();
      setAutocompleteResults(data);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchAutocomplete(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?query=${encodeURIComponent(searchQuery)}&page=1`);
      setAutocompleteResults([]);
    }
  };

  const handleAutocompleteClick = (title) => {
    setSearchQuery(title);
    navigate(`/?query=${encodeURIComponent(title)}&page=1`);
    setAutocompleteResults([]);
  };

  // Theme removed

  return (
  <nav className="fixed top-0 w-full z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" aria-label="Home">
          <img src={logo} alt="ThiraiView" className="h-8 w-auto md:h-9" />
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 mx-4 md:mx-8 max-w-sm relative">
          <Input type="text" placeholder="Search movies..." value={searchQuery} onChange={handleSearchInput} className="rounded-r-none" />
          <Button type="submit" className="rounded-l-none">Search</Button>

          {/* Autocomplete dropdown */}
          {autocompleteResults.length > 0 && (
            <ul className="absolute top-12 left-0 right-0 bg-white border border-gray-200 w-full max-h-64 overflow-auto rounded-lg shadow-lg z-50">
              {autocompleteResults.map((movie) => (
                <li key={movie.id} onClick={() => handleAutocompleteClick(movie.title)} className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-gray-900 transition-colors duration-150">{movie.title}</li>
              ))}
            </ul>
          )}
        </form>

        {/* Desktop Menu - flat links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Home</Link>
          {user && <Link to="/feed" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Feed</Link>}
          <Link to="/watchlist" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Watchlist</Link>
          {user && user.isSuperuser && (
            <Link to="/superuser-dashboard" className="text-red-600 hover:text-red-700 transition-colors duration-200 font-medium">
              🔐 Superuser
            </Link>
          )}
          {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && !user.isSuperuser && (
            <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Admin Dashboard</Link>
          )}
          {user && <Link to="/add-movie" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Add Movie</Link>}
          {user && (
            <>
              <Link to="/notifications" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 relative p-2">
                🔔
                {/* You could add a notification badge here */}
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Profile</Link>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium">Login</Link>
              <Button as="span" variant="primary"><Link to="/signup">Sign Up</Link></Button>
            </>
          )}
          {user && (
            <>
              <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border border-gray-200 rounded-lg mx-4 p-4 mt-2 space-y-4 shadow-lg">
          {/* Search Bar (Mobile) */}
          <form onSubmit={handleSearchSubmit} className="flex relative">
            <Input type="text" placeholder="Search movies..." value={searchQuery} onChange={handleSearchInput} className="rounded-r-none" />
            <Button type="submit" className="rounded-l-none">Go</Button>

            {/* Autocomplete dropdown (mobile) */}
            {autocompleteResults.length > 0 && (
              <ul className="absolute top-12 left-0 right-0 bg-white border border-gray-200 w-full max-h-64 overflow-auto rounded-lg shadow-lg z-50">
                {autocompleteResults.map((movie) => (
                  <li
                    key={movie.id}
                    onClick={() => handleAutocompleteClick(movie.title)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-gray-900 transition-colors duration-150"
                  >
                    {movie.title}
                  </li>
                ))}
              </ul>
            )}
          </form>

          <Link to="/" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">
            Home
          </Link>
          {user && (
            <Link to="/feed" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">
              Feed
            </Link>
          )}
          <Link to="/watchlist" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">
            Watchlist
          </Link>

          {!user && (
            <>
              <Link to="/login" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">Login</Link>
              <Link to="/signup" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">Sign Up</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/notifications" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">
                🔔 Notifications
              </Link>
              <Link to="/profile" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">Profile</Link>
              {user && user.isSuperuser && (
                <Link to="/superuser-dashboard" className="block text-red-600 hover:text-red-700 transition-colors duration-200 py-2 font-medium">
                  🔐 Superuser Dashboard
                </Link>
              )}
              {(user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && !user.isSuperuser) && (
                <Link to="/admin-dashboard" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">Admin Dashboard</Link>
              )}
              <Link to="/add-movie" className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2 font-medium">Add Movie</Link>
              <button onClick={handleLogout} className="w-full text-left text-red-600 hover:underline py-2 font-medium transition-colors duration-200">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
