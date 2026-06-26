// src/features/products/productsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ProductsState, ProductFilters } from "../../types";
import { productsApi } from "../../services/productsApi";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      return await productsApi.getProducts(filters);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await productsApi.getProductById(id);
    } catch (err: any) {
      return rejectWithValue("Product not found");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  filters: {
    page: 1,
    limit: 12,
    sortBy: "newest",
  },
  totalCount: 0,
  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage(state, action) {
      state.filters.page = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, clearFilters, clearSelectedProduct } =
  productsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectProducts = (state: { products: ProductsState }) =>
  state.products.items;
export const selectSelectedProduct = (state: { products: ProductsState }) =>
  state.products.selectedProduct;
export const selectProductFilters = (state: { products: ProductsState }) =>
  state.products.filters;
export const selectProductsLoading = (state: { products: ProductsState }) =>
  state.products.isLoading;
export const selectProductsTotalCount = (state: { products: ProductsState }) =>
  state.products.totalCount;

export default productsSlice.reducer;
