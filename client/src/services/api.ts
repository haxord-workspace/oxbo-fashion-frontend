import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // Add auth token here if available
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

export default api;
