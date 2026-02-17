import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Simple In-Memory Cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for slow networks
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Check Cache
apiClient.interceptors.request.use((config) => {
  if (config.method === 'get') {
    const key = config.url + JSON.stringify(config.params);
    const cached = cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log('⚡ Served from Cache:', config.url);
      // Use adapter to return cached response immediately without hitting network
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });
      };
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Save to Cache & Retry Logic
apiClient.interceptors.response.use((response) => {
    // Cache successful GET requests
    if (response.config.method === 'get') {
        const key = response.config.url + JSON.stringify(response.config.params);
        cache.set(key, {
            data: response.data,
            timestamp: Date.now()
        });
    }
    return response;
}, async (error) => {
  const config = error.config;
  if (!config || !config.retry) {
    config.retry = 0;
  }

  // Retry up to 3 times for network errors
  if (config.retry < 3 && (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
    config.retry += 1;
    const delay = config.retry * 1000; // 1s, 2s, 3s backoff
    await new Promise(resolve => setTimeout(resolve, delay));
    return apiClient(config);
  }

  return Promise.reject(error);
});

export default apiClient;
