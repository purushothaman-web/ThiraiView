import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Failed to parse user:", err);
      return null;
    }
  };

  const getStoredToken = () => {
    return localStorage.getItem("token") || null;
  };

  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [user, token]);

const login = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      identifier,
      password,
    });

    const { accessToken, user } = response.data;

    if (accessToken) {
      setToken(accessToken);
      setUser(user);

      // Store in localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch (err) {
    console.error("Login failed:", err);
    throw err; // Let component catch and show error
  }
};

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
