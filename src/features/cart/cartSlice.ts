// src/features/cart/cartSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartState, CartItem, Product } from "../../types";

const initialState: CartState = {
  items: [],
  couponCode: null,
  discountPercent: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product.id === product.id);

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + quantity,
          product.stock
        );
      } else {
        state.items.push({ product, quantity });
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
    },

    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product.id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product.id !== productId);
        } else {
          item.quantity = Math.min(quantity, item.product.stock);
        }
      }
    },

    clearCart(state) {
      state.items = [];
      state.couponCode = null;
      state.discountPercent = 0;
    },

    applyCoupon(
      state,
      action: PayloadAction<{ code: string; discountPercent: number }>
    ) {
      state.couponCode = action.payload.code;
      state.discountPercent = action.payload.discountPercent;
    },

    removeCoupon(state) {
      state.couponCode = null;
      state.discountPercent = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCartItems = (state: { cart: CartState }): CartItem[] =>
  state.cart.items;

export const selectCartCount = (state: { cart: CartState }): number =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartSubtotal = (state: { cart: CartState }): number =>
  state.cart.items.reduce(
    (sum, i) => sum + (i.product.discountPrice ?? i.product.price) * i.quantity,
    0
  );

export const selectCartDiscount = (state: { cart: CartState }): number => {
  const subtotal = selectCartSubtotal(state);
  return (subtotal * state.cart.discountPercent) / 100;
};

export const selectCartTotal = (state: { cart: CartState }): number => {
  const subtotal = selectCartSubtotal(state);
  const discount = selectCartDiscount(state);
  const shipping = subtotal > 500 ? 0 : 49; // Free shipping above ₹500
  return subtotal - discount + shipping;
};

export const selectShippingCharge = (state: { cart: CartState }): number => {
  const subtotal = selectCartSubtotal(state);
  return subtotal > 500 ? 0 : 49;
};

export default cartSlice.reducer;
