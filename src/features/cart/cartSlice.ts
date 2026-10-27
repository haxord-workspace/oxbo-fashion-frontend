import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Coupon } from '../../types';
import type { RootState } from '../../app/store';
import { cartApi } from '../../services/user/cart.Api';
import { userCouponsApi } from '../../services/user/coupons.Api';
import { trackAddToCart } from '../../utils/metaPixel';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  appliedCoupon: Coupon | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  couponCode: null,
  appliedCoupon: null,
  isLoading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await cartApi.getCart();
    const data = response.data || response;

    // Auto-clean corrupted / orphaned items from server cart (where product was deleted in database)
    const rawItems = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    const orphanedItems = rawItems.filter((item: any) => {
      if (item.product) return false;
      return !item.productId || (!item.productId._id && typeof item.productId !== 'string' && !item.productId.name);
    });

    if (orphanedItems.length > 0) {
      for (const badItem of orphanedItems) {
        // Try removing using MongoDB cart item _id, or variantId
        const deleteKey = badItem._id || badItem.id || badItem.variantId?._id || badItem.variantId;
        if (deleteKey && deleteKey !== 'unknown') {
          try {
            await cartApi.removeFromCart(deleteKey);
          } catch (cleanErr) {
            console.warn('Could not auto-clean corrupted cart item:', cleanErr);
          }
        }
      }
    }

    return data;
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
    
    // Hybrid Meta Pixel + CAPI Tracking
    let requestConfig;
    try {
      const { headers } = trackAddToCart({
        productId,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: (item.product.category as any)?.name || (item.product.category as any),
      });
      requestConfig = { headers };
    } catch {
      // Ignore tracking errors to avoid blocking shopping cart operations
    }

    await cartApi.addToCart(payload, requestConfig);
    return item;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCartItemAsync = createAsyncThunk('cart/update', async ({ id, variantId, quantity }: { id?: string, variantId?: string, quantity: number }, { rejectWithValue }) => {
  try {
    const targetId = (variantId && variantId !== 'default' && variantId !== 'unknown') ? variantId : id;
    if (!targetId || targetId === 'unknown') {
      return rejectWithValue('Invalid item ID for update');
    }
    await cartApi.updateCartItem(targetId, quantity);
    return { id, variantId, quantity };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeFromCartAsync = createAsyncThunk('cart/remove', async ({ id, variantId }: { id?: string, variantId?: string }, { rejectWithValue }) => {
  try {
    const targetId = (variantId && variantId !== 'default' && variantId !== 'unknown')
      ? variantId
      : (id && id !== 'unknown' ? id : undefined);

    if (!targetId) {
      return rejectWithValue('Invalid item ID for removal');
    }
    await cartApi.removeFromCart(targetId);
    return { id, variantId };
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
    const cleanCode = code.trim().toUpperCase();
    
    // Validate with user API (backend handles validation rules)
    const validateResponse = await userCouponsApi.validateCoupon(cleanCode, cartTotal);
    
    // Apply to cart on backend
    const applyResponse = await cartApi.applyCoupon(cleanCode);
    
    // Extract coupon from response if available
    let coupon = validateResponse.data?.coupon || validateResponse.coupon;

    if (!coupon || !coupon.type) {
      // Fallback: if backend doesn't return full coupon details, construct a fixed discount based on the updated cart
      const discountAmount = applyResponse.data?.discount ?? applyResponse.discount ?? 0;
      coupon = {
        code: cleanCode,
        type: 'fixed',
        value: discountAmount,
        isActive: true
      };
    } else {
      // Ensure code is set just in case
      coupon.code = cleanCode;
    }

    return coupon;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to apply coupon');
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
      const existingItem = state.items.find(item => {
        const isSameProduct = item.product.id === action.payload.product.id || (item.product as any)._id === (action.payload.product as any)._id;
        const isSameVariant = item.variantId === action.payload.variantId;
        return isSameProduct && isSameVariant;
      });
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

        const mapApiItemToCartItem = (apiItem: any) => {
          if (apiItem.product) {
            return {
              ...apiItem,
              id: apiItem.id || apiItem._id,
            };
          }

          const rawId = apiItem._id || apiItem.id;
          const prodId = apiItem.productId?._id || apiItem.productId?.id || (typeof apiItem.productId === 'string' ? apiItem.productId : undefined);
          const varId = apiItem.variantId?._id || apiItem.variantId?.id || (typeof apiItem.variantId === 'string' ? apiItem.variantId : undefined);
          const isMissingProduct = !apiItem.productId || (!apiItem.productId?._id && typeof apiItem.productId !== 'string' && !apiItem.productId?.name);
          
          return {
            id: rawId,
            product: {
              id: prodId || rawId || 'unknown',
              name: isMissingProduct ? 'Unavailable Product' : (apiItem.productId?.name || 'Unknown Product'),
              imageUrl: apiItem.variantId?.images?.[0] || apiItem.productId?.thumbnail || apiItem.productId?.imageUrl || '',
              price: apiItem.price || apiItem.variantId?.price || apiItem.productId?.price || 0,
              mrp: apiItem.variantId?.price || apiItem.productId?.mrp || 0,
              category: apiItem.productId?.categoryId || 'Category',
            },
            quantity: apiItem.quantity || 1,
            selectedColor: apiItem.variantId?.attributes?.color,
            selectedSize: apiItem.variantId?.attributes?.size,
            variantId: varId,
            isUnavailable: isMissingProduct,
          };
        };

        const rawList = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
        // Filter out corrupted items whose product no longer exists so they don't block cart operations
        const validList = rawList.filter((apiItem: any) => {
          if (apiItem.product) return true;
          return !!(apiItem.productId && (apiItem.productId._id || typeof apiItem.productId === 'string' || apiItem.productId.name));
        });

        state.items = validList.map(mapApiItemToCartItem);
        state.couponCode = data.couponCode || null;
        if (data.coupon) {
          state.appliedCoupon = data.coupon;
        } else if (data.discountPercent) {
          state.appliedCoupon = { code: data.couponCode || '', type: 'percentage', value: data.discountPercent, isActive: true };
        } else if (data.discount !== undefined) {
          state.appliedCoupon = { code: data.couponCode || '', type: 'fixed', value: data.discount, isActive: true };
        } else {
          state.appliedCoupon = null;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add to Cart
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const existingItem = state.items.find(item => {
          const isSameProduct = item.product.id === action.payload.product.id || (item.product as any)._id === (action.payload.product as any)._id;
          const isSameVariant = item.variantId === action.payload.variantId;
          return isSameProduct && isSameVariant;
        });
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
        const item = state.items.find(item => {
          const isSameItem = item.id && (item.id === action.payload.id || item.id === action.payload.variantId);
          const isSameProduct = item.product.id === action.payload.id || (item.product as any)._id === action.payload.id;
          const isSameVariant = item.variantId === action.payload.variantId;
          return isSameItem || (isSameProduct && isSameVariant);
        });
        if (item) {
          item.quantity = action.payload.quantity;
        }
      })

      // Remove from Cart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(item => {
          const isSameItem = item.id && (item.id === action.payload.id || item.id === action.payload.variantId);
          const isSameProduct = item.product.id === action.payload.id || (item.product as any)._id === action.payload.id;
          const isSameVariant = item.variantId === action.payload.variantId;
          return !(isSameItem || (isSameProduct && isSameVariant));
        });
        toast.success('Removed from cart');
      })
      .addCase(removeFromCartAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Failed to remove from cart');
      })

      // Clear Cart
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
        state.couponCode = null;
        state.appliedCoupon = null;
      })

      // Apply Coupon
      .addCase(applyCouponAsync.fulfilled, (state, action) => {
        state.couponCode = action.payload.code;
        state.appliedCoupon = action.payload;
        toast.success('Coupon applied successfully');
      })
      .addCase(applyCouponAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Invalid coupon code');
      })

      // Remove Coupon
      .addCase(removeCouponAsync.fulfilled, (state) => {
        state.couponCode = null;
        state.appliedCoupon = null;
        toast.success('Coupon removed');
      });
  }
});

export const { addItemLocal } = cartSlice.actions;

// Selectors
// Only show cart count when the user is authenticated — never show a badge for guests
export const selectCartCount = (state: RootState) => {
  if (!state.auth?.user) return 0;
  return state.cart.items.reduce((count, item) => count + (item.quantity || 0), 0);
};

export const selectCartTotal = (state: RootState) => {
  const subtotal = state.cart.items.reduce((total, item) => {
    if (!item || !item.product || typeof item.product.price !== 'number') return total;
    return total + (item.product.price * item.quantity);
  }, 0);
  
  const coupon = state.cart.appliedCoupon;
  let discount = 0;
  
  if (coupon) {
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }
  }
  
  return Math.max(0, subtotal - discount);
};

export const selectShippingCharge = (_state: RootState) => {
  return 0; // Free shipping as per the UI reference "FREE SHIPPING ON EVERY ORDERS"
};

export default cartSlice.reducer;
