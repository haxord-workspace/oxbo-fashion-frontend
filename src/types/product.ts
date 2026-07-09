export interface ProductVariant {
  color: string;
  images: string[];
  sizes: {
    size: string;
    stock: number;
  }[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Discounted/Current price
  mrp?: number; // Original Price
  discountAmount?: number;
  imageUrl: string;
  category: string;
  subCategory?: string;
  storeId?: string; // For multi-store
  variants?: ProductVariant[];
}
