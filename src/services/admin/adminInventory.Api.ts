import api from '../api';

export interface StockData {
  storeId: string;
  variantId: string;
  quantity: number;
  remarks?: string;
}

export const adminInventoryApi = {
  addStock: async (data: StockData): Promise<any> => {
    const response = await api.post('/inventory/add-stock', data);
    return response.data;
  },

  reduceStock: async (data: StockData): Promise<any> => {
    const response = await api.post('/inventory/reduce-stock', data);
    return response.data;
  },

  adjustStock: async (data: StockData): Promise<any> => {
    const response = await api.post('/inventory/adjust-stock', data);
    return response.data;
  },

  reserveStock: async (data: Omit<StockData, 'remarks'>): Promise<any> => {
    const response = await api.post('/inventory/reserve-stock', data);
    return response.data;
  },

  releaseStock: async (data: Omit<StockData, 'remarks'>): Promise<any> => {
    const response = await api.post('/inventory/release-stock', data);
    return response.data;
  },

  getTransactions: async (params?: any): Promise<any> => {
    const response = await api.get('/inventory-transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<any> => {
    const response = await api.get(`/inventory-transactions/${id}`);
    return response.data;
  }
};
