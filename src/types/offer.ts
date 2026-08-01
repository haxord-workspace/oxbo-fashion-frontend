export interface Offer {
  _id?: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  productId: string;
  product?: any;
  isActive: boolean;
  status?: 'Scheduled' | 'Active' | 'Expired';
  createdAt?: string;
  updatedAt?: string;
}
