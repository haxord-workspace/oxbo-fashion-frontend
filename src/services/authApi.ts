import api from './api';
import type { User } from '../types';
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
   
    const accessToken = response.headers['authorization']?.replace('Bearer ', '') || 
                        response.headers['x-auth-token'] || 
                        response.headers['access-token'] || 
                        response.data.data?.tokens?.accessToken || 
                        response.data.data?.token ||
                        response.data.accessToken || 
                        response.data.token || '';
                        
    const refreshToken = response.headers['x-refresh-token'] || 
                         response.headers['refresh-token'] || 
                         response.data.data?.tokens?.refreshToken || 
                         response.data.refreshToken || '';

    return {
      user: response.data.data?.user || response.data.data,
      accessToken,
      refreshToken,
      message: response.data.message,
    };
  },

  logout: async (): Promise<{ message?: string }> => {
    const response = await api.post('/auth/logout');
    return { message: response.data.message };
  },

  register: async (data: { firstName: string; lastName: string; email: string; password: string; phone: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    
    const accessToken = response.headers['authorization']?.replace('Bearer ', '') || 
                        response.headers['x-auth-token'] || 
                        response.headers['access-token'] || 
                        response.data.data?.tokens?.accessToken || 
                        response.data.data?.token ||
                        response.data.accessToken || 
                        response.data.token || '';
                        
    const refreshToken = response.headers['x-refresh-token'] || 
                         response.headers['refresh-token'] || 
                         response.data.data?.tokens?.refreshToken || 
                         response.data.refreshToken || '';

    return {
      user: response.data.data?.user || response.data.data,
      accessToken,
      refreshToken,
      message: response.data.message,
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
  }
};
