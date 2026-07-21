import api from '../api';

export const adminOrderApi = {
  getOrders: async (params?: { page?: number; limit?: number; search?: string; status?: string; store?: string }) => {
    const response = await api.get('/orders/admin', { params });
    const data = response.data.data || response.data;
    return {
      orders: data.orders || data || [],
      total: data.total || data.length || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.patch(`/orders/admin/${id}/status`, { status });
    return response.data;
  },
  updateOrderTracking: async (id: string, trackingData: any) => {
    const response = await api.patch(`/orders/admin/${id}/tracking`, trackingData);
    return response.data;
  },
  downloadInvoice: async (id: string) => {
    const response = await api.get(`/orders/admin/${id}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  },
  assignStore: async (id: string, storeId: string) => {
    const response = await api.patch(`/orders/admin/${id}/assign-store`, { storeId });
    return response.data;
  }
};
