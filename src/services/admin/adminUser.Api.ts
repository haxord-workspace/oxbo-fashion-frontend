import api from '../api';
import type { User } from '../../types';

export const adminUserApi = {
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }): Promise<{ users: User[], total: number }> => {
    const response = await api.get('/users', { params });
    const data = response.data.data || response.data;
    const users = data.users || data.docs || (Array.isArray(data) ? data : []);
    const total = data.total || data.totalDocs || users.length || 0;
    return { users, total };
  },

  getAllCustomers: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ customers: User[], total: number }> => {
    const response = await api.get('/customers', { params });
    const data = response.data.data || response.data;
    const customers = data.customers || data.docs || (Array.isArray(data) ? data : []);
    const total = data.total || data.totalDocs || customers.length || 0;
    return { customers, total };
  },

  getCustomerById: async (customerId: string): Promise<User> => {
    const response = await api.get(`/customers/${customerId}`);
    return response.data.data || response.data;
  },

  getCustomerOrders: async (customerId: string): Promise<any[]> => {
    const response = await api.get(`/customers/${customerId}/orders`);
    return response.data.data || [];
  },

  getCustomerOrderSummary: async (customerId: string): Promise<{ orderCount: number, totalPurchaseAmount: number }> => {
    const response = await api.get(`/customers/${customerId}/order-summary`);
    return response.data.data;
  },

  createUser: async (data: Partial<User> & { password?: string } | FormData): Promise<{ user: User, message?: string }> => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/users', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return {
      user: response.data.data?.user || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteUser: async (userId: string): Promise<{ message?: string }> => {
    const response = await api.delete(`/users/${userId}`);
    return { message: response.data.message };
  },

  updateUser: async (userId: string, data: Partial<User> | FormData) => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/users/${userId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return { user: response.data.data?.user || response.data.data || response.data, message: response.data.message };
  },

  getCustomerStatistics: async (): Promise<{ totalCustomers: number, activeCustomers: number, inactiveCustomers: number, newCustomersThisMonth: number }> => {
    const response = await api.get('/customers/statistics');
    return response.data.data;
  }
};

