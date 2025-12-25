import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setAutocompleteResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsProfileOpen(false);
  };

  // === Async Search ===
  const fetchAutocomplete = async (query) => {
    if (!query) {
      setAutocompleteResults([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/movies/autocomplete?query=${encodeURIComponent(query)}`);
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
      setIsMenuOpen(false); // Valid for mobile
    }
  };

  const handleAutocompleteClick = (title) => {
    setSearchQuery(title);
    navigate(`/?query=${encodeURIComponent(title)}&page=1`);
    setAutocompleteResults([]);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Feed", path: "/feed", auth: true },
    { name: "Watchlist", path: "/watchlist" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${isScrolled
        ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md border-gray-200/50 dark:border-gray-700/50 py-3"
        : "bg-white dark:bg-gray-900 shadow-none py-4"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">

        {/* === Logo === */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="ThiraiView" className="h-9 w-auto md:h-10 transition-transform duration-300" />
        </Link>

        {/* === Desktop Search === */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-gray-100 transition-all"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* Autocomplete Dropdown */}
          {autocompleteResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              {autocompleteResults.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleAutocompleteClick(movie.title)}
                  className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-200 transition-colors"
                >
                  {movie.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === Desktop Navigation === */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            (!link.auth || user) && (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}

          {/* Admin / Superuser Links */}
          {user && user.isSuperuser && (
            <Link to="/superuser-dashboard" className="text-red-500 hover:text-red-600 font-medium text-sm border border-red-200 dark:border-red-900/50 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20">
              Superuser
            </Link>
          )}

          {/* Auth Buttons / Profile Dropdown */}
          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium">Login</Link>
              <Link to="/signup" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-transform transform hover:scale-105 shadow-md shadow-blue-500/30">
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/add-movie" className="hidden lg:block text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                + Add Movie
              </Link>
              <Link to="/notifications" className="text-gray-500 hover:text-blue-600 transition-colors relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Badge could go here */}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={(() => {
                      const diceBearFallback = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(user.name || 'user')}`;

                      if (!user.profilePicture) return diceBearFallback;
                      if (user.profilePicture.startsWith('http')) return user.profilePicture;

                      const normalized = user.profilePicture.replace(/\\/g, "/");
                      const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

                      // Strip /api from BASE_URL if targeting static files (uploads)
                      const rootUrl = (BASE_URL || 'http://localhost:3000').replace(/\/api$/, '').replace(/\/$/, '');

                      return `${rootUrl}${path}`;
                    })()}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-all shadow-sm"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-fadeIn z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user.name}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsProfileOpen(false)}>
                      Your Profile
                    </Link>
                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && !user.isSuperuser && (
                      <Link to="/admin-dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsProfileOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/add-movie" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 md:hidden" onClick={() => setIsProfileOpen(false)}>
                      Add Movie
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-red-400 transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* === Mobile Toggle === */}
        <div className="flex md:hidden items-center gap-4">
          {user && (
            <Link to="/notifications" className="text-gray-600 dark:text-gray-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 dark:text-gray-300 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* === Mobile Menu === */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-4 py-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-medium"
            />
            {autocompleteResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {autocompleteResults.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleAutocompleteClick(movie.title)}
                    className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {movie.title}
                  </div>
                ))}
              </div>
            )}
          </form>

          {navLinks.map((link) => (
            (!link.auth || user) && (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-1"
              >
                {link.name}
              </Link>
            )
          ))}

          {user && (
            <>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 py-1">Profile</Link>
              <Link to="/add-movie" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-blue-600 py-1">Add Movie</Link>
              {user.isSuperuser && (
                <Link to="/superuser-dashboard" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-red-600 hover:text-red-700 py-1">Superuser Dashboard</Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'MODERATOR') && !user.isSuperuser && (
                <Link to="/admin-dashboard" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-gray-800 hover:text-blue-600 py-1">Admin Dashboard</Link>
              )}
            </>
          )}

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
            {!user ? (
              <div className="flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 rounded-lg bg-blue-600 text-white font-medium shadow-md">Sign Up</Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="w-full text-center py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
