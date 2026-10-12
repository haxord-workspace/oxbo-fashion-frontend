export interface Offer {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  productId?: string | any | null;
  product?: any;
  isActive: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

