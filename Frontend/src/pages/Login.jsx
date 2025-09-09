import React, { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { isNonEmptyString } from "../components/ui/validation";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);  // ✅ get login() from context
  const navigate = useNavigate();
  const location = useLocation();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isNonEmptyString(identifier) || !isNonEmptyString(password)) {
    setError("Username/email and password are required");
    return;
  }

  setError(""); // Clear error on new submit

  try {
    await login(identifier, password);
    // Wait for state update to propagate
    setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      navigate(next || "/");
    }, 0);
  } catch (error) {
    // Handle unverified account specifically
    if (error.response?.status === 403 && error.response?.data?.code === 'UNVERIFIED_ACCOUNT') {
      // Navigate to verification pending page with email
      navigate(`/verify-pending?email=${encodeURIComponent(identifier)}`);
    } else {
      setError(error.response?.data?.message || error.response?.data?.error || "Login failed. Please check your credentials.");
    }
  }
};


  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">Log In</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Username or Email</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
            placeholder="Enter your username or email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
            placeholder="Enter your password"
          />
        </div>

        {error && <p className="text-red-700 dark:text-red-400 text-sm mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-3 rounded-lg mt-6 transition-colors duration-200 font-medium shadow-sm"
        >
          Log In
        </button>
        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don't have an account? <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Sign up</Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Forgot your password?</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
