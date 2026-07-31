import api from '../api';

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export const adminEnquiryApi = {
  getEnquiries: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/contact', { params });
    const payload = response.data.data || response.data;
    return {
      enquiries: payload.data || payload.contacts || payload || [],
      total: payload.total || payload.pagination?.total || 0,
      page: payload.page || payload.pagination?.page || 1,
      pages: payload.totalPages || payload.pagination?.totalPages || 1,
    };
  },
  getEnquiryById: async (id: string) => {
    const response = await api.get(`/contact/${id}`);
    return response.data.data || response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/contact/${id}/read`);
    return response.data.data || response.data;
  }
};
