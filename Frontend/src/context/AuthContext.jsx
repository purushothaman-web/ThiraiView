import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with credentials for cookies
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for HttpOnly cookies
});

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const validateToken = async (token) => {
    try {
      const response = await apiClient.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.status === 200; // Token is valid if the backend returns 200
    } catch (error) {
      console.error("Token validation failed:", error);
      return false; // Token is invalid
    }
  };

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      validateToken(storedToken)
        .then(isValid => {
          if (isValid) {
            setToken(storedToken);
            setUser(storedUser);
          } else {
            console.log("Stored token is invalid. Logging out.");
            // Clear local storage and state
            setToken(null);
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        });
    }
  }, []);

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

  // Add request interceptor to include access token
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  // Add response interceptor for auto-refresh
  useEffect(() => {
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (isRefreshing) {
            // If already refreshing, wait for it to complete
            return new Promise((resolve) => {
              const interval = setInterval(() => {
                if (!isRefreshing) {
                  clearInterval(interval);
                  resolve(apiClient(originalRequest));
                }
              }, 100);
            });
          }

          try {
            setIsRefreshing(true);
            const response = await apiClient.post('/auth/refresh');
            const { accessToken } = response.data;
            
            setToken(accessToken);
            localStorage.setItem("token", accessToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          } finally {
            setIsRefreshing(false);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [isRefreshing]);

  const login = async (identifier, password) => {
    try {
      // Clear any previous error state
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      const response = await apiClient.post('/login', {
        identifier,
        password,
      });

      const { accessToken, user } = response.data;

      if (accessToken && user) {
        setToken(accessToken);
        setUser(user);
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        // Wait for state to update before returning
        await new Promise((resolve) => setTimeout(resolve, 0));
      } else {
        // Defensive: clear state if login response is malformed
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Invalid login response");
      }
    } catch (err) {
      // Always clear state on failed login
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.error("Login failed:", err);
      throw err; // Let component catch and show error
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to revoke refresh token
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with local logout even if server call fails
    } finally {
      // Clear local state regardless of server response
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, apiClient }}>
      {children}
    </AuthContext.Provider>
  );
};
