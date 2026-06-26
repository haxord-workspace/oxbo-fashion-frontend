// src/features/orders/ordersSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { OrdersState, Address } from "../../types";
import { ordersApi } from "../../services/ordersApi";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await ordersApi.getOrders();
    } catch (err: any) {
      return rejectWithValue("Failed to fetch orders");
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await ordersApi.getOrderById(id);
    } catch (err: any) {
      return rejectWithValue("Order not found");
    }
  }
);

export const placeOrder = createAsyncThunk(
  "orders/place",
  async (
    payload: {
      shippingAddress: Address;
      paymentMethod: "cod" | "online";
    },
    { rejectWithValue }
  ) => {
    try {
      return await ordersApi.placeOrder(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Order placement failed");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState: OrdersState = {
  items: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      });

    builder
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload); // New order at top
        state.selectedOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectOrders = (state: { orders: OrdersState }) => state.orders.items;
export const selectSelectedOrder = (state: { orders: OrdersState }) =>
  state.orders.selectedOrder;
export const selectOrdersLoading = (state: { orders: OrdersState }) =>
  state.orders.isLoading;

export default ordersSlice.reducer;
