import api from '../api';

export const adminDashboardApi = {
  getSuperAdminDashboard: async (): Promise<any> => {
    const response = await api.get('/dashboard/super-admin');
    return response.data?.data || response.data;
  },

  getStoreManagerDashboard: async (): Promise<any> => {
    const response = await api.get('/dashboard/store-manager');
    return response.data?.data || response.data;
  }
};
