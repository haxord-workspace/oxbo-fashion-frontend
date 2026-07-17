import api from '../api';

export interface GeneralSettings {
  siteName: string;
  siteLogo: string | File;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  maintenanceMode: boolean;
}

export interface TaxSettings {
  taxPercentage: number;
  taxEnabled: boolean;
  taxIncludedInPrice: boolean;
}

export interface ShippingSettings {
  shippingCharge: number;
  freeShippingEnabled: boolean;
  freeShippingMinOrderAmount: number;
  estimatedDeliveryDays: number;
}

export interface PaymentSettings {
  cashOnDeliveryEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  autoCapturePayment: boolean;
  refundEnabled: boolean;
}

export const adminSettingsApi = {
  getGeneralSettings: async () => {
    try {
      const response = await api.get('/settings/general');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateGeneralSettings: async (data: FormData) => {
    try {
      const response = await api.put('/settings/general', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getTaxSettings: async () => {
    try {
      const response = await api.get('/settings/tax');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateTaxSettings: async (data: TaxSettings) => {
    try {
      const response = await api.put('/settings/tax', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getShippingSettings: async () => {
    try {
      const response = await api.get('/settings/shipping');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateShippingSettings: async (data: ShippingSettings) => {
    try {
      const response = await api.put('/settings/shipping', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getPaymentSettings: async () => {
    try {
      const response = await api.get('/settings/payment');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updatePaymentSettings: async (data: PaymentSettings) => {
    try {
      const response = await api.put('/settings/payment', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
};
