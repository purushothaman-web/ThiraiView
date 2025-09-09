// src/api/axiosInstance.js
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAxios = () => {
  const { token, setToken, logout } = useContext(AuthContext);

  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 🔑 important for refresh cookie
  });

  // Add access token to requests
  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle 401 → refresh token
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const newAccessToken = res.data.accessToken;

          setToken(newAccessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (err) {
          logout(); // Refresh failed → force logout
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
