import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);  // ✅ get login() from context
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!identifier || !password) {
    setError("Username/email and password are required");
    return;
  }

  try {
    await login(identifier, password); // ✅ correct now
    navigate("/");
  } catch (error) {
    setError("Login failed. Please check your credentials.");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-96"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Log In</h2>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Username or Email</label>
  <input
    type="text"
    value={identifier}
    onChange={(e) => setIdentifier(e.target.value)}
    className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>


        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-lg mt-4 hover:bg-blue-600"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
