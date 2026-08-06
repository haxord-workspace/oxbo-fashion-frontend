import api from '../api';
import type { Product } from '../../types';

export const adminProductApi = {
  getProducts: async (params?: any): Promise<{ products: Product[], total: number }> => {
    const response = await api.get('/products', { params });
    let products = [];
    let total = 0;
    
    if (Array.isArray(response.data.data)) {
      products = response.data.data;
      total = response.data.total || response.data.data.length;
    } else if (response.data.data?.products || response.data.data?.docs) {
      products = response.data.data.products || response.data.data.docs;
      total = response.data.data.total || response.data.data.totalDocs || products.length;
    } else if (Array.isArray(response.data)) {
      products = response.data;
      total = products.length;
    }
    
    return { products, total };
  },

  updateProduct: async (productId: string, data: any): Promise<{ product: Product, message?: string }> => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/products/${productId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return {
      product: response.data.data?.product || response.data.data || response.data,
      message: response.data.message
    };
  },

  createProduct: async (data: any): Promise<{ product: Product, message?: string }> => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/products', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return {
      product: response.data.data?.product || response.data.data || response.data,
      message: response.data.message
    };
  },

  updateProductStatus: async (productId: string, status: string | any): Promise<{ product: Product, message?: string }> => {
    const response = await api.patch(`/products/${productId}/status`, typeof status === 'string' ? { status } : status);
    return {
      product: response.data.data?.product || response.data.data || response.data,
      message: response.data.message
    };
  },

  createVariant: async (productId: string, data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    const response = await api.post(`/products/${productId}/variants`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  updateVariant: async (variantId: string, data: any): Promise<any> => {
    const isFormData = data instanceof FormData;
    const response = await api.put(`/variants/${variantId}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  getVariants: async (productId: string): Promise<any> => {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  getSizeOptions: async (productId: string): Promise<any> => {
    const response = await api.get(`/products/${productId}/size-options`);
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<any> => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  deleteVariant: async (variantId: string): Promise<any> => {
    const response = await api.delete(`/variants/${variantId}`);
    return response.data;
  },

  getBulkUploadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/products/bulk-upload/template', { responseType: 'blob' });
    return response.data;
  },

  uploadBulkProducts: async (data: FormData): Promise<any> => {
    const response = await api.post('/products/bulk-upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
