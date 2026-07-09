import api from '../api';
import type { Brand, BrandsResponse } from '../../types';

export const adminBrandApi = {
  createBrand: async (data: FormData): Promise<{ brand: Brand, message?: string }> => {
    const response = await api.post('/brands', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      brand: response.data.data?.brand || response.data.data || response.data,
      message: response.data.message
    };
  },

  getBrands: async (params?: { page?: number; limit?: number; search?: string }): Promise<BrandsResponse> => {
    const response = await api.get('/brands', { params });
    const data = response.data.data || response.data;
    return {
      brands: data.brands || data || [],
      total: data.total || data.length || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  getBrandById: async (id: string): Promise<{ brand: Brand, message?: string }> => {
    const response = await api.get(`/brands/${id}`);
    return {
      brand: response.data.data?.brand || response.data.data || response.data,
      message: response.data.message
    };
  },

  updateBrand: async (id: string, data: FormData): Promise<{ brand: Brand, message?: string }> => {
    const response = await api.put(`/brands/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      brand: response.data.data?.brand || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteBrand: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/brands/${id}`);
    return {
      message: response.data.message || 'Brand deleted successfully'
    };
  },

  updateBrandStatus: async (id: string, isActive: boolean): Promise<{ brand: Brand, message?: string }> => {
    const response = await api.patch(`/brands/${id}/status`, { isActive });
    return {
      brand: response.data.data?.brand || response.data.data || response.data,
      message: response.data.message
    };
  }
};
