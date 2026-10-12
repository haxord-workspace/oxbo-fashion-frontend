import type { Product } from './product';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  variantId?: string;
  isUnavailable?: boolean;
}
