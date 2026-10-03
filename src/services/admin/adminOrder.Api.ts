import api from '../api';

export const adminOrderApi = {
  getOrders: async (params?: { page?: number; limit?: number; search?: string; status?: string; store?: string }) => {
    const response = await api.get('/orders/admin', { params });
    const data = response.data.data || response.data;
    return {
      orders: data.orders || data || [],
      total: data.pagination?.total || data.total || data.orders?.length || data.length || 0,
      page: data.pagination?.page || data.page || 1,
      pages: data.pagination?.totalPages || data.pages || 1,
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
  },
  refundPayment: async (orderId: string, amount?: number, reason?: string) => {
    const response = await api.post('/payments/refund', { orderId, amount, reason });
    return response.data;
  },
  acceptPayment: async (orderId: string, paymentId: string) => {
    const response = await api.post('/payments/accept', { orderId, paymentId });
    return response.data;
  },
  rejectPayment: async (orderId: string, reason?: string) => {
    const response = await api.post('/payments/reject', { orderId, reason });
    return response.data;
  },
  getPaymentHistory: async (params?: any) => {
    const response = await api.get('/payments/history', { params });
    return response.data;
  }
};
