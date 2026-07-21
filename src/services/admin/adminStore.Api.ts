import api from '../api';
import type { Store, User } from '../../types';

export const adminStoreApi = {
  createStore: async (data: Partial<Store>): Promise<{ store: Store, message?: string }> => {
    const response = await api.post('/stores', data);
    return {
      store: response.data.data?.store || response.data.data || response.data,
      message: response.data.message
    };
  },

  getStores: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ stores: Store[], total: number }> => {
    const response = await api.get('/stores', { params });
    let stores = [];
    let total = 0;

    if (Array.isArray(response.data.data)) {
      stores = response.data.data;
      total = response.data.total || response.data.data.length;
    } else if (response.data.data?.stores || response.data.data?.docs) {
      stores = response.data.data.stores || response.data.data.docs;
      total = response.data.data.meta?.total || response.data.data.total || response.data.data.totalDocs || stores.length;
    } else if (Array.isArray(response.data)) {
      stores = response.data;
      total = stores.length;
    }

    return { stores, total };
  },

  getStoreById: async (storeId: string): Promise<{ store: Store }> => {
    const response = await api.get(`/stores/${storeId}`);
    return {
      store: response.data.data?.store || response.data.data || response.data
    };
  },

  updateStore: async (storeId: string, data: Partial<Store>): Promise<{ store: Store, message?: string }> => {
    const response = await api.put(`/stores/${storeId}`, data);
    return {
      store: response.data.data?.store || response.data.data || response.data,
      message: response.data.message
    };
  },

  activateStore: async (storeId: string): Promise<{ store: Store, message?: string }> => {
    const response = await api.patch(`/stores/${storeId}/activate`);
    return {
      store: response.data.data?.store || response.data.data || response.data,
      message: response.data.message
    };
  },

  deactivateStore: async (storeId: string): Promise<{ store: Store, message?: string }> => {
    const response = await api.patch(`/stores/${storeId}/deactivate`);
    return {
      store: response.data.data?.store || response.data.data || response.data,
      message: response.data.message
    };
  },

  assignStoreAdmin: async (storeId: string, data: any): Promise<{ store: Store, message?: string }> => {
    const response = await api.post(`/stores/${storeId}/admins`, data);
    return {
      store: response.data.data?.store || response.data.data || response.data,
      message: response.data.message
    };
  },

  getStoreAdmins: async (storeId: string): Promise<{ admins: User[], message?: string }> => {
    const response = await api.get(`/stores/${storeId}/admins`);
    return {
      admins: response.data.data?.admins || response.data.data || response.data || [],
      message: response.data.message
    };
  },

  removeStoreAdmin: async (storeId: string, adminId: string): Promise<{ store: Store, message?: string }> => {
    const response = await api.delete(`/stores/${storeId}/admins/${adminId}`);
    return {
      store: response.data.data?.store || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteStore: async (storeId: string): Promise<{ message?: string }> => {
    const response = await api.delete(`/stores/${storeId}`);
    return { message: response.data.message };
  }
};