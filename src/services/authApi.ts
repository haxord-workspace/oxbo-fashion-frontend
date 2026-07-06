import api from './api';
import type { User } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return {
      user: response.data.data.user,
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
    };
  },

  register: async (data: { firstName: string; lastName: string; email: string; password: string; phone: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return {
      user: response.data.data.user,
      accessToken: response.data.data.tokens.accessToken,
      refreshToken: response.data.data.tokens.refreshToken,
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
    return response.data.data ? { accessToken: response.data.data.tokens?.accessToken || response.data.data.accessToken } : response.data;
  }
};
