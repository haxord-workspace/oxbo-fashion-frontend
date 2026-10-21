import axios from 'axios';
import Cookies from 'js-cookie';
import { getMetaCookies } from '../utils/metaPixel';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Routes that require authentication — a fully-failed refresh here means redirect to login
const PROTECTED_PATH_PREFIXES = [
  '/profile',
  '/orders',
  '/checkout',
  '/cart',
  '/wishlist',
  '/notifications',
  '/admin',
];

const isOnProtectedPage = () => {
  const path = window.location.pathname;
  return PROTECTED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const clearAuthTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// ─── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  let token: string | undefined | null =
    Cookies.get('accessToken') || localStorage.getItem('accessToken');
  const refreshToken =
    Cookies.get('refreshToken') || localStorage.getItem('refreshToken');

  // If no access token but have a refresh token, try to refresh proactively
  if (!token && refreshToken && !config.url?.includes('/auth/refresh')) {
    if (isRefreshing) {
      try {
        token = await new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      } catch (err) {
        return config;
      }
    } else {
      isRefreshing = true;
      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );
        
        let newAccessToken = '';
        const data = refreshResponse.data;
        if (typeof data === 'string') newAccessToken = data;
        else if (typeof data?.data === 'string') newAccessToken = data.data;
        else if (data) {
          const findToken = (obj: any, key: string): string => {
            if (!obj || typeof obj !== 'object') return '';
            if (obj[key] && typeof obj[key] === 'string') return obj[key];
            for (const k in obj) {
              const res = findToken(obj[k], key);
              if (res) return res;
            }
            return '';
          };
          newAccessToken = findToken(data, 'accessToken') || findToken(data, 'token') || '';
        }

        if (newAccessToken) {
          Cookies.set('accessToken', newAccessToken, { sameSite: 'strict' });
          localStorage.setItem('accessToken', newAccessToken);
          token = newAccessToken;
        }
        processQueue(null, token);
      } catch (error) {
        processQueue(error, null);
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (token === 'undefined' || token === 'null') token = null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach Meta browser tracking cookies if available for server-side attribution
  try {
    const { fbp, fbc } = getMetaCookies();
    if (fbp && !config.headers['x-meta-fbp']) {
      config.headers['x-meta-fbp'] = fbp;
    }
    if (fbc && !config.headers['x-meta-fbc']) {
      config.headers['x-meta-fbc'] = fbc;
    }
  } catch {
    // Ignore error
  }

  return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      const isLoginPage = window.location.pathname.includes('/login');

      if (!isLoginPage) {
        try {
          const currentRefreshToken = Cookies.get('refreshToken') || localStorage.getItem('refreshToken');
          // Attempt a silent token refresh
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken: currentRefreshToken },
            { withCredentials: true }
          );

          let newAccessToken = '';
          const data = refreshResponse.data;
          if (typeof data === 'string') newAccessToken = data;
          else if (typeof data?.data === 'string') newAccessToken = data.data;
          else if (data) {
            const findToken = (obj: any, key: string): string => {
              if (!obj || typeof obj !== 'object') return '';
              if (obj[key] && typeof obj[key] === 'string') return obj[key];
              for (const k in obj) {
                const res = findToken(obj[k], key);
                if (res) return res;
              }
              return '';
            };
            newAccessToken = findToken(data, 'accessToken') || findToken(data, 'token') || '';
          }

          if (newAccessToken) {
            Cookies.set('accessToken', newAccessToken, { sameSite: 'strict' });
            localStorage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          } else {
             // Continue without throwing to avoid force logout if extraction fails slightly
             console.warn('Refresh token succeeded but no access token was extracted. Proceeding anyway.');
          }

          return api(originalRequest);
        } catch (refreshError: any) {
          // Both access and refresh tokens are expired — clear everything
          clearAuthTokens();

          // Only force-redirect when the user is on a page that requires authentication.
          // On public pages (Home, Products, Collections, etc.) we silently clear the
          // session and let the auth slice handle the state — no unwanted redirects.
          if (isOnProtectedPage()) {
            const isAdminRoute = window.location.pathname.startsWith('/admin');
            window.location.href = isAdminRoute ? '/admin/login' : '/login';
          }

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
