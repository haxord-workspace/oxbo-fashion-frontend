export interface Coupon {
  _id?: string;
  code: string;
  title?: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  isActive: boolean;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponsResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  pages: number;
}
