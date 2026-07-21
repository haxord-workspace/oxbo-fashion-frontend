import api from '../api';

export const userCouponsApi = {
  /**
   * Validate a coupon code before applying it
   */
  validateCoupon: async (couponCode: string, cartTotal: number) => {
    const response = await api.post('/coupons/validate', {
      couponCode,
      cartTotal
    });
    return response.data;
  }
};
