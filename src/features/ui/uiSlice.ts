import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
}

const initialState: UiState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
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
  },
});

export const { toggleCart, toggleMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;
