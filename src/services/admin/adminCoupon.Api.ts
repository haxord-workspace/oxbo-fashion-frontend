import api from '../api';
import type { Coupon, CouponsResponse } from '../../types';

export const adminCouponApi = {
  createCoupon: async (data: Partial<Coupon>): Promise<{ coupon: Coupon, message?: string }> => {
    const response = await api.post('/coupons', data);
    return {
      coupon: response.data.data?.coupon || response.data.data || response.data,
      message: response.data.message
    };
  },

  getCoupons: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<CouponsResponse> => {
    const response = await api.get('/coupons', { params });
    const data = response.data.data || response.data;
    return {
      coupons: data.coupons || data || [],
      total: data.total || data.length || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  getCouponById: async (id: string): Promise<{ coupon: Coupon, message?: string }> => {
    const response = await api.get(`/coupons/${id}`);
    return {
      coupon: response.data.data?.coupon || response.data.data || response.data,
      message: response.data.message
    };
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<{ coupon: Coupon, message?: string }> => {
    const response = await api.put(`/coupons/${id}`, data);
    return {
      coupon: response.data.data?.coupon || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteCoupon: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/coupons/${id}`);
    return {
      message: response.data.message || 'Coupon deleted successfully'
    };
  },

  updateCouponStatus: async (id: string, isActive: boolean): Promise<{ coupon: Coupon, message?: string }> => {
    const response = await api.patch(`/coupons/${id}/status`, { isActive });
    return {
      coupon: response.data.data?.coupon || response.data.data || response.data,
      message: response.data.message
    };
  }
};
