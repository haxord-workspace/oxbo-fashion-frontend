// src/services/axiosInstance.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && BASE_URL?.startsWith('/')) {
  console.error(
    `VITE_API_URL ("${BASE_URL}") is a relative path. That only works via the Vite dev proxy ` +
    'and will not reach the backend in a deployed build. Set VITE_API_URL to the backend\'s ' +
    'absolute URL (e.g. https://your-backend.onrender.com/api/v1) in your hosting provider\'s ' +
    'environment variables.'
  );
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Attach token ────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
