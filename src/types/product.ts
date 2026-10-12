export interface ProductVariant {
  _id?: string;
  id?: string;
  color?: string;
  size?: string;
  status?: string;
  images?: string[];
  price?: number;
  salePrice?: number;
  costPrice?: number; // Original/MRP price for the variant
  stock?: number;
  quantity?: number;
  sizes?: {
    size: string;
    stock: number;
    variantId?: string;
  }[];
  /** Flat API response format: { color, size } nested under attributes */
  attributes?: {
    color?: string;
    size?: string;
    [key: string]: string | undefined;
  };
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number; // Discounted/Current price
  mrp?: number; // Original Price
  discountAmount?: number;
  imageUrl?: string;
  thumbnail?: string;
  gallery?: string[];
  category: string;
  subCategory?: string;
  brand?: string;
  brandId?: { _id?: string; name?: string; slug?: string };
  storeId?: string; // For multi-store
  variants?: ProductVariant[];
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  createdBy?: string;
  search?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
