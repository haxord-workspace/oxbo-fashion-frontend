import api from '../api';
import type { Offer } from '../../types';

export const adminOfferApi = {
  getOffers: async (params?: any): Promise<{ offers: Offer[], total: number }> => {
    const response = await api.get('/offers', { params });
    let offers = [];
    let total = 0;
    
    if (Array.isArray(response.data.data)) {
      offers = response.data.data;
      total = response.data.total || response.data.data.length;
    } else if (response.data.data?.offers || response.data.data?.docs) {
      offers = response.data.data.offers || response.data.data.docs;
      total = response.data.data.total || response.data.data.totalDocs || offers.length;
    } else if (Array.isArray(response.data)) {
      offers = response.data;
      total = offers.length;
    }
    
    return { offers, total };
  },

  getOfferById: async (offerId: string): Promise<Offer> => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data.data?.offer || response.data.data || response.data;
  },

  createOffer: async (data: Partial<Offer>): Promise<{ offer: Offer, message?: string }> => {
    const response = await api.post('/offers', data);
    return {
      offer: response.data.data?.offer || response.data.data || response.data,
      message: response.data.message
    };
  },

  updateOffer: async (offerId: string, data: Partial<Offer>): Promise<{ offer: Offer, message?: string }> => {
    const response = await api.put(`/offers/${offerId}`, data);
    return {
      offer: response.data.data?.offer || response.data.data || response.data,
      message: response.data.message
    };
  },

  deleteOffer: async (offerId: string): Promise<any> => {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  },
  
  updateOfferStatus: async (offerId: string, isActive: boolean): Promise<any> => {
    const response = await api.patch(`/offers/${offerId}/status`, { isActive });
    return response.data;
  }
};
