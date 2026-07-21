import api from '../api';

export interface CreateOrderData {
  shippingAddressId: string;
  paymentReference?: string;
  notes?: string;
  storeId?: string; // Sometimes included based on user example
}

export const userOrdersApi = {
  /**
   * Create a new order
   */
  createOrder: async (data: CreateOrderData) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  /**
   * Get order history with optional pagination and status filters
   */
  getOrderHistory: async (page: number = 1, limit: number = 10, status?: string) => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get details for a specific order
   */
  getOrderDetails: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Track an order
   */
  trackOrder: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/track`);
    return response.data;
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, data?: any) => {
    const response = await api.patch(`/orders/${orderId}/cancel`, data);
    return response.data;
  },

  /**
   * Placeholders for Razorpay Integration
   */
  createRazorpayOrder: async (data: any) => {
    // Replace with your actual endpoint that returns Razorpay order_id
    const response = await api.post('/payment/razorpay/create', data);
    return response.data;
  },
  
  verifyRazorpayPayment: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
    // Replace with your actual endpoint that verifies the payment signature
    const response = await api.post('/payment/razorpay/verify', data);
    return response.data;
  }
};
