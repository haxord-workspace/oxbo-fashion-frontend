import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';
import type { RootState } from '../../app/store';
import { cartApi } from '../../services/user/cart.Api';
import { userCouponsApi } from '../../services/user/coupons.Api';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  couponCode: null,
  discountPercent: 0,
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartApi.getCart();
    // Map response if necessary. Assuming response.data returns the cart items and potentially coupon.
    return response.data || response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToCartAsync = createAsyncThunk('cart/add', async (item: CartItem, { rejectWithValue }) => {
  try {
    const productId = item.product.id || (item.product as any)._id;
    const payload: any = { 
      productId: productId, 
      quantity: item.quantity 
    };
    if (item.variantId && item.variantId !== 'default') {
      payload.variantId = item.variantId;
    } else {
      // Fallback: If backend strictly requires variantId but we don't have one,
      // send the productId as a fallback to pass the validation layer.
      payload.variantId = productId;
    }
    
    await cartApi.addToCart(payload);
    return item;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCartItemAsync = createAsyncThunk('cart/update', async ({ id, variantId, quantity }: { id: string, variantId?: string, quantity: number }, { rejectWithValue }) => {
  try {
    await cartApi.updateCartItem(variantId || id, quantity);
    return { id, quantity };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeFromCartAsync = createAsyncThunk('cart/remove', async ({ id, variantId }: { id: string, variantId?: string }, { rejectWithValue }) => {
  try {
    await cartApi.removeFromCart(variantId || id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const clearCartAsync = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartApi.clearCart();
    return true;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const applyCouponAsync = createAsyncThunk('cart/applyCoupon', async ({ code, cartTotal }: { code: string, cartTotal: number }, { rejectWithValue }) => {
  try {
    const validateResponse = await userCouponsApi.validateCoupon(code, cartTotal);
    await cartApi.applyCoupon(code);
    return { code, percent: validateResponse.discountPercent || 10 }; // Fallback 10% if not returned
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeCouponAsync = createAsyncThunk('cart/removeCoupon', async (_, { rejectWithValue }) => {
  try {
    await cartApi.removeAllCoupons();
    return true;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Keep local actions for optimistic UI updates if needed, but thunks handle it
    addItemLocal(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id || (item.product as any)._id === (action.payload.product as any)._id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;
        if (data.items) {
          state.items = data.items;
          state.couponCode = data.couponCode || null;
          state.discountPercent = data.discountPercent || 0;
        } else if (Array.isArray(data)) {
          state.items = data;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to Cart
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const existingItem = state.items.find(item => item.product.id === action.payload.product.id || (item.product as any)._id === (action.payload.product as any)._id);
        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
        } else {
          state.items.push(action.payload);
        }
        toast.success('Added to cart');
      })
      .addCase(addToCartAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Failed to add to cart');
      })

      // Update Quantity
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        const item = state.items.find(item => item.product.id === action.payload.id || (item.product as any)._id === action.payload.id);
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })

      // Remove from Cart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product.id !== action.payload && (item.product as any)._id !== action.payload);
        toast.success('Removed from cart');
      })
      .addCase(removeFromCartAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Failed to remove from cart');
      })

      // Clear Cart
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.couponCode = null;
        state.discountPercent = 0;
      })

      // Apply Coupon
      .addCase(applyCouponAsync.fulfilled, (state, action) => {
        state.couponCode = action.payload.code;
        state.discountPercent = action.payload.percent;
        toast.success('Coupon applied!');
      })
      .addCase(applyCouponAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Invalid coupon code');
      })

      // Remove Coupon
      .addCase(removeCouponAsync.fulfilled, (state) => {
        state.couponCode = null;
        state.discountPercent = 0;
        toast.success('Coupon removed');
      });
  }
});

export const { addItemLocal } = cartSlice.actions;

// Selectors
export const selectCartCount = (state: RootState) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

export const selectCartTotal = (state: RootState) => {
  const subtotal = state.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const discount = subtotal * (state.cart.discountPercent / 100);
  return subtotal - discount;
};

export const selectShippingCharge = (_state: RootState) => {
  return 0; // Free shipping as per the UI reference "FREE SHIPPING ON EVERY ORDERS"
};

export default cartSlice.reducer;
