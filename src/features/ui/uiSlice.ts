// src/features/ui/uiSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UiState, Toast, ToastType } from "../../types";

const initialState: UiState = {
  toasts: [],
  isCartOpen: false,
  isMobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast(
      state,
      action: PayloadAction<{ message: string; type?: ToastType }>
    ) {
      const toast: Toast = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type ?? "info",
      };
      state.toasts.push(toast);
    },

    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },

    openCart(state) {
      state.isCartOpen = true;
    },

    closeCart(state) {
      state.isCartOpen = false;
    },

    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },

    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    closeMobileMenu(state) {
      state.isMobileMenuOpen = false;
    },
  },
});

export const {
  showToast,
  dismissToast,
  openCart,
  closeCart,
  toggleCart,
  toggleMobileMenu,
  closeMobileMenu,
} = uiSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectToasts = (state: { ui: UiState }) => state.ui.toasts;
export const selectIsCartOpen = (state: { ui: UiState }) => state.ui.isCartOpen;
export const selectIsMobileMenuOpen = (state: { ui: UiState }) =>
  state.ui.isMobileMenuOpen;

export default uiSlice.reducer;
