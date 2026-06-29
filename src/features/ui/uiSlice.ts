import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UiState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen;
    },
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    showToast(state, action: PayloadAction<{ message: string; type: Toast['type'] }>) {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const { toggleCart, toggleMobileMenu, showToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
