import api from '../api';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  storeId?: string;
}

export const adminReportsApi = {
  getSalesReports: async (params?: ReportParams): Promise<any> => {
    const response = await api.get('/reports/sales', { params });
    return response.data?.data || response.data;
  },

  getInventoryReports: async (params?: ReportParams): Promise<any> => {
    const response = await api.get('/reports/inventory', { params });
    return response.data?.data || response.data;
  },

  getOrderReports: async (params?: ReportParams): Promise<any> => {
    const response = await api.get('/reports/orders', { params });
    return response.data?.data || response.data;
  },

  getCustomerReports: async (params?: ReportParams): Promise<any> => {
    const response = await api.get('/reports/customers', { params });
    return response.data?.data || response.data;
  },

  getStoreReports: async (params?: ReportParams): Promise<any> => {
    const response = await api.get('/reports/stores', { params });
    return response.data?.data || response.data;
  }
};
