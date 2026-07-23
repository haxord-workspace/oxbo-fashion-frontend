import api from '../api';
import type { Category } from '../../types';

export const adminCategoriesApi = {
  createCategory: async (data: FormData): Promise<{ category: Category, message?: string }> => {
    const response = await api.post('/categories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      category: response.data.data?.category || response.data.data || response.data,
      message: response.data.message
    };
  },
  Subcategory: async (data: FormData): Promise<{ category: Category, message?: string }> => {
    const response = await api.post('/categories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      category: response.data.data?.category || response.data.data || response.data,
      message: response.data.message
    };
  },

  getCategoryTree: async (): Promise<{ categories: Category[], message?: string }> => {
    const response = await api.get('/categories/tree');
    return {
      categories: response.data.data?.categories || response.data.data || response.data || [],
      message: response.data.message
    };
  },

  getRootCategories: async (): Promise<{ categories: Category[], message?: string }> => {
    const response = await api.get('/categories/root');
    return {
      categories: response.data.data?.categories || response.data.data || response.data || [],
      message: response.data.message
    };
  },

  getCategories: async (params?: { page?: number; limit?: number; search?: string; sort?: string; isActive?: boolean }): Promise<{ categories: Category[], total: number }> => {
    const response = await api.get('/categories', { params });
    let categories = [];
    let total = 0;
    
    if (Array.isArray(response.data.data)) {
      categories = response.data.data;
      total = response.data.meta?.total || response.data.total || response.data.data.length;
    } else if (response.data.data?.categories || response.data.data?.docs) {
      categories = response.data.data.categories || response.data.data.docs;
      total = response.data.meta?.total || response.data.data.total || response.data.data.totalDocs || categories.length;
    } else if (Array.isArray(response.data)) {
      categories = response.data;
      total = (response.data as any).meta?.total || categories.length;
    }
    
    return { categories, total };
  },

  getCategoryChildren: async (categoryId: string): Promise<{ categories: Category[], message?: string }> => {
    const response = await api.get(`/categories/${categoryId}/children`);
    return {
      categories: response.data.data?.categories || response.data.data || response.data || [],
      message: response.data.message
    };
  },

  getCategoryById: async (categoryId: string): Promise<{ category: Category, message?: string }> => {
    const response = await api.get(`/categories/${categoryId}`);
    return {
      category: response.data.data?.category || response.data.data || response.data,
      message: response.data.message
    };
  },

  updateCategory: async (categoryId: string, data: FormData): Promise<{ category: Category, message?: string }> => {
    const response = await api.put(`/categories/${categoryId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      category: response.data.data?.category || response.data.data || response.data,
      message: response.data.message
    };
  },

  activateCategory: async (categoryId: string): Promise<{ category: Category, message?: string }> => {
    const response = await api.patch(`/categories/${categoryId}/activate`);
    return {
      category: response.data.data?.category || response.data.data || response.data,
      message: response.data.message
    };
  },
  
  deactivateCategory: async (categoryId: string): Promise<{ category: Category, message?: string }> => {
    const response = await api.patch(`/categories/${categoryId}/deactivate`);
    return {
      category: response.data.data?.category || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteCategory: async (categoryId: string): Promise<{ message?: string }> => {
    const response = await api.delete(`/categories/${categoryId}`);
    return { message: response.data.message };
  }
};


