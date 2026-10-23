import api from './api';
import Cookies from 'js-cookie';
import type { User } from '../types';
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export const authApi = {
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { identifier, password });

    const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // Deep search function to find keys no matter where they are nested
    const findToken = (obj: any, key: string): string => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj[key] && typeof obj[key] === 'string') return obj[key];
      for (const k in obj) {
        const result = findToken(obj[k], key);
        if (result) return result;
      }
      return '';
    };

    const accessToken = findToken(responseData, 'accessToken') ||
      findToken(responseData, 'token') ||
      response.headers['authorization']?.replace('Bearer ', '') ||
      response.headers['x-auth-token'] ||
      response.headers['access-token'] ||
      '';

    const refreshToken = findToken(responseData, 'refreshToken') ||
      response.headers['x-refresh-token'] ||
      response.headers['refresh-token'] ||
      '';


    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      Cookies.set('accessToken', accessToken, { sameSite: 'strict' });
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      Cookies.set('refreshToken', refreshToken, { sameSite: 'strict' });
    }

    return {
      user: responseData.data?.user || responseData.data || responseData.user,
      accessToken,
      refreshToken,
      message: responseData.message,
    };
  },

  logout: async (): Promise<{ message?: string }> => {
    try {
      await api.delete('/notifications/fcm-token');
      localStorage.removeItem('oxbo_fcm_token');
    } catch {
      // Ignore errors if token deletion fails during logout
    }
    const response = await api.post('/auth/logout');
    return { message: response.data.message };
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/google', { credential });

    const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // Deep search function to find keys no matter where they are nested
    const findToken = (obj: any, key: string): string => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj[key] && typeof obj[key] === 'string') return obj[key];
      for (const k in obj) {
        const result = findToken(obj[k], key);
        if (result) return result;
      }
      return '';
    };

    const accessToken = findToken(responseData, 'accessToken') ||
      findToken(responseData, 'token') ||
      response.headers['authorization']?.replace('Bearer ', '') ||
      response.headers['x-auth-token'] ||
      response.headers['access-token'] ||
      '';

    const refreshToken = findToken(responseData, 'refreshToken') ||
      response.headers['x-refresh-token'] ||
      response.headers['refresh-token'] ||
      '';

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      Cookies.set('accessToken', accessToken, { sameSite: 'strict' });
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      Cookies.set('refreshToken', refreshToken, { sameSite: 'strict' });
    }

    return {
      user: responseData.data?.user || responseData.data || responseData.user,
      accessToken,
      refreshToken,
      message: responseData.message,
    };
  },

  register: async (data: { firstName: string; lastName: string; email: string; password: string; phone: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);

    const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    const findToken = (obj: any, key: string): string => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj[key] && typeof obj[key] === 'string') return obj[key];
      for (const k in obj) {
        const result = findToken(obj[k], key);
        if (result) return result;
      }
      return '';
    };

    const accessToken = findToken(responseData, 'accessToken') ||
      findToken(responseData, 'token') ||
      response.headers['authorization']?.replace('Bearer ', '') ||
      response.headers['x-auth-token'] ||
      response.headers['access-token'] ||
      '';

    const refreshToken = findToken(responseData, 'refreshToken') ||
      response.headers['x-refresh-token'] ||
      response.headers['refresh-token'] ||
      '';

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      Cookies.set('accessToken', accessToken, { sameSite: 'strict' });
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      Cookies.set('refreshToken', refreshToken, { sameSite: 'strict' });
    }

    return {
      user: responseData.data?.user || responseData.data || responseData.user,
      accessToken,
      refreshToken,
      message: responseData.message,
    };
  },

  updateProfile: async (_userId: string, data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.patch(`/auth/profile`, data);
    return response.data.data ? { user: response.data.data.user } : response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data.data ? { user: response.data.data.user || response.data.data } : response.data;
  },

  refreshToken: async (token: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken: token });
    const accessToken = response.data.data?.tokens?.accessToken ||
      response.data.data?.token ||
      response.data.data?.accessToken ||
      response.data.token ||
      response.data.accessToken || '';
    return { accessToken };
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: any): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};
