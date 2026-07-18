import api from '../api';

export interface WishlistItem {
  productId: string;
  variantId?: string;
}

export const wishlistApi = {
  /**
   * Get wishlist details for the user
   */
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  /**
   * Get variants for a specific product
   */
  getProductVariants: async (productId: string) => {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  /**
   * Add an item to the wishlist
   */
  addToWishlist: async (data: WishlistItem) => {
    const response = await api.post('/wishlist', data);
    return response.data;
  },

  /**
   * Remove an item from the wishlist
   * @param variantId The variant ID to remove
   */
  removeFromWishlist: async (variantId: string) => {
    const response = await api.delete(`/wishlist/${variantId}`);
    return response.data;
  }
};
