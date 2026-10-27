import api from '../api';
import type {
  AbandonedCart,
  AbandonedCartsResponse,
  AbandonedCartQueryParams,
  AbandonedCartStats,
  AbandonedCartSettings,
  SendRecoveryPayload
} from '../../types';

export const adminAbandonedCartApi = {
  getAbandonedCarts: async (params?: AbandonedCartQueryParams): Promise<AbandonedCartsResponse> => {
    const response = await api.get('/abandoned-carts', { params });
    const data = response.data.data || response.data;
    const docs = data.docs || data.carts || data.abandonedCarts || (Array.isArray(data) ? data : []);
    return {
      carts: docs,
      total: data.total ?? data.totalDocs ?? data.pagination?.total ?? docs.length ?? 0,
      page: data.page ?? data.pagination?.page ?? 1,
      pages: data.totalPages ?? data.pages ?? data.pagination?.pages ?? 1,
      limit: data.limit ?? data.pagination?.limit ?? 10,
    };
  },

  getAbandonedCartStats: async (): Promise<AbandonedCartStats> => {
    const response = await api.get('/abandoned-carts/stats');
    const data = response.data.data || response.data;
    const statsObj = data.stats || data;
    return {
      totalAbandoned: statsObj.totalAbandoned ?? statsObj.total ?? statsObj.abandoned ?? 0,
      totalRecovered: statsObj.totalRecovered ?? statsObj.recovered ?? 0,
      totalRecoveredRevenue: statsObj.totalRecoveredRevenue ?? statsObj.recoveredRevenue ?? statsObj.revenue ?? 0,
      conversionRate: statsObj.conversionRate !== undefined ? Number(statsObj.conversionRate) : 0,
      activeCount: statsObj.activeCount ?? statsObj.active ?? 0,
    };
  },

  getAbandonedCartById: async (id: string): Promise<AbandonedCart> => {
    const response = await api.get(`/abandoned-carts/${id}`);
    const data = response.data.data || response.data;
    return data.doc || data.cart || data.abandonedCart || data;
  },

  sendRecovery: async (id: string, payload: SendRecoveryPayload): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/abandoned-carts/${id}/send-recovery`, payload);
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Recovery notification dispatched successfully',
    };
  },

  getSettings: async (): Promise<AbandonedCartSettings> => {
    const response = await api.get('/abandoned-carts/settings');
    const data = response.data.data || response.data;
    return data.settings || data;
  },

  updateSettings: async (data: Partial<AbandonedCartSettings>): Promise<{ success: boolean; message: string; settings: AbandonedCartSettings }> => {
    const response = await api.put('/abandoned-carts/settings', data);
    const resData = response.data.data || response.data;
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Abandoned cart settings updated successfully',
      settings: resData.settings || resData,
    };
  },

  scanNow: async (): Promise<{ success: boolean; message: string; scannedCount?: number }> => {
    const response = await api.post('/abandoned-carts/scan-now');
    const data = response.data.data || response.data;
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Cart scan executed successfully',
      scannedCount: data?.scannedCount || data?.count,
    };
  },

  dispatchNow: async (): Promise<{ success: boolean; message: string; dispatchedCount?: number }> => {
    const response = await api.post('/abandoned-carts/dispatch-now');
    const data = response.data.data || response.data;
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Recovery notifications dispatched successfully',
      dispatchedCount: data?.dispatchedCount || data?.count,
    };
  },
};
