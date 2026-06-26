import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
}

const initialState: OrdersState = {
  items: [],
  selectedOrder: null,
  isLoading: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    placeOrder(state, action: PayloadAction<Order>) {
      state.items.push(action.payload);
    },
    fetchOrders(state, action: PayloadAction<Order[]>) {
      state.items = action.payload;
    },
    fetchOrderById(state, action: PayloadAction<Order>) {
      state.selectedOrder = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    }
  },
});

export const { placeOrder, fetchOrders, fetchOrderById, setLoading } = ordersSlice.actions;
export default ordersSlice.reducer;
