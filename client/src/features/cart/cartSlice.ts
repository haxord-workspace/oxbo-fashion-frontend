import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';
import type { RootState } from '../../app/store';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
}

const initialState: CartState = {
  items: [],
  couponCode: null,
  discountPercent: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.product.id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find(item => item.product.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    applyCoupon(state, action: PayloadAction<{ code: string; percent: number }>) {
      state.couponCode = action.payload.code;
      state.discountPercent = action.payload.percent;
    },
    removeCoupon(state) {
      state.couponCode = null;
      state.discountPercent = 0;
    }
  },
});

export const { addItem, removeItem, updateQuantity, applyCoupon, removeCoupon } = cartSlice.actions;

// Selectors
export const selectCartCount = (state: RootState) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartTotal = (state: RootState) => {
  const subtotal = state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const discount = subtotal * (state.cart.discountPercent / 100);
  return subtotal - discount;
};

export const selectShippingCharge = (_state: RootState) => {
  // Free shipping as per the UI reference "FREE SHIPPING ON EVERY ORDERS"
  return 0;
};

export default cartSlice.reducer;
