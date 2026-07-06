import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          // IMPORTANT: use a new axios instance to avoid interceptor loops if the refresh fails
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          
          const newAccessToken = refreshResponse.data.accessToken;
          Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'strict' });
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear cookies and force logout
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login'; // Or dispatch logout event
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        Cookies.remove('accessToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
