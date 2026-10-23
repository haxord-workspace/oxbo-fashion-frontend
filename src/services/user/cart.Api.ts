import type { AxiosRequestConfig } from 'axios';
import api from '../api';

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export const cartApi = {
  /**
   * Get the current user's shopping cart
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add an item to the cart with optional request config (e.g. Meta tracking headers)
   */
  addToCart: async (data: CartItem, config?: AxiosRequestConfig) => {
    const response = await api.post('/cart', data, config);
    return response.data;
  },

  /**
   * Update the quantity of an item in the cart
   */
  updateCartItem: async (variantId: string, quantity: number) => {
    const response = await api.patch(`/cart/${variantId}`, { quantity });
    return response.data;
  },

  /**
   * Remove an item from the cart
   */
  removeFromCart: async (variantId: string) => {
    const response = await api.delete(`/cart/${variantId}`);
    return response.data;
  },

  /**
   * Clear the entire cart
   */
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  /**
   * Apply a coupon to the cart
   */
  applyCoupon: async (couponCode: string) => {
    const response = await api.post('/cart/apply-coupon', { couponCode });
    return response.data;
  },

  /**
   * Remove all coupons from the cart
   */
  removeAllCoupons: async () => {
    const response = await api.delete('/cart/remove-coupon/all');
    return response.data;
  },

  /**
   * Recover an abandoned cart using a recovery token
   */
  recoverAbandonedCart: async (recoveryToken: string) => {
    const response = await api.get(`/abandoned-carts/recover/${recoveryToken}`);
    return response.data;
  },

  /**
   * Unsubscribe from abandoned cart reminder notifications
   */
  unsubscribeFromCartReminders: async (token: string) => {
    const response = await api.get(`/abandoned-carts/unsubscribe/${token}`);
    return response.data;
  }
};

