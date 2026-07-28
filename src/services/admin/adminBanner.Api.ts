import api from '../api';

export interface Banner {
  _id?: string;
  id?: string;
  title: string;
  image: string | File;
  redirectUrl: string;
  isActive: boolean;
  sortOrder: number;
  position: string;
  startDate?: string;
  endDate?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const adminBannerApi = {
  getBanners: async (params?: any) => {
    try {
      const response = await api.get('/banners', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getBannerById: async (id: string) => {
    try {
      const response = await api.get(`/banners/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  
  createBanner: async (data: FormData) => {
    try {
      const response = await api.post('/banners', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  
  updateBanner: async (id: string, data: FormData) => {
    try {
      const response = await api.put(`/banners/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
  
  updateBannerStatus: async (id: string, data: any) => {
    try {
      const response = await api.patch(`/banners/${id}/status`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateBannerSortOrder: async (id: string, data: any) => {
    try {
      const response = await api.patch(`/banners/${id}/sort-order`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  deleteBanner: async (id: string) => {
    try {
      const response = await api.delete(`/banners/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
};
