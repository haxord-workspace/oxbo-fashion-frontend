import api from '../api';
import type { User } from '../../types';

export const adminUserApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data?.users || response.data.data || response.data;
  },

  createUser: async (data: Partial<User> & { password?: string }): Promise<{ user: User, message?: string }> => {
    const response = await api.post('/users', data);
    return {
      user: response.data.data?.user || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteUser: async (userId: string): Promise<{ message?: string }> => {
    const response = await api.delete(`/users/${userId}`);
    return { message: response.data.message };
  },

  updateUser: async (userId: string, data: Partial<User>) => {
    const response = await api.patch(`/users/${userId}`, data);
    return { user: response.data.data?.user || response.data.data || response.data, message: response.data.message };
  }
};

