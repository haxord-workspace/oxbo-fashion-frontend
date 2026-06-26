// src/types/index.ts

// ─── User / Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  limit?: number;
}

export interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  status: OrderStatus;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

// ─── UI ───────────────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface UiState {
  toasts: Toast[];
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
