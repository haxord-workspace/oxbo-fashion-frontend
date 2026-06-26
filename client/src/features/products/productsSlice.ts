import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  filters: {
    category: string | null;
    search: string | null;
  };
  totalCount: number;
  page: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  filters: { category: null, search: null },
  totalCount: 0,
  page: 1,
  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProducts(state, action: PayloadAction<{ items: Product[], totalCount: number }>) {
      state.items = action.payload.items;
      state.totalCount = action.payload.totalCount;
    },
    fetchProductById(state, action: PayloadAction<Product>) {
      state.selectedProduct = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<ProductsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to page 1 on filter change
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    }
  },
});

export const { fetchProducts, fetchProductById, setFilters, setPage, setLoading, setError } = productsSlice.actions;
export default productsSlice.reducer;
