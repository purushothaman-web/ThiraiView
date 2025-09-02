import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-500 p-4">
      <ul className="flex space-x-4 text-white items-center">
        <li>
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/add-movie" className="hover:text-gray-300">
                Add Movie
              </Link>
            </li>
            <li>
              <Link to="/watchlist" className="hover:text-gray-300">
                My Watchlist
              </Link>
            </li>
            <li>Welcome, {user.name}</li>
            <li>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-gray-300">
                Signup
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
