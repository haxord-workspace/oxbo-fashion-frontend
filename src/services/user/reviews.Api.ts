import api from '../api';

export interface CreateReviewData {
  productId: string;
  rating: number;
  title: string;
  review: string;
  images?: string[];
}

export const userReviewsApi = {
  /**
   * Add a review for a product.
   * Note: The user can only add a review after the product is delivered.
   */
  addReview: async (data: CreateReviewData) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
  
  /**
   * Get all reviews for a specific product
   */
  getProductReviews: async (productId: string) => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  /**
   * Get all reviews
   */
  getAllReviews: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  }
};
