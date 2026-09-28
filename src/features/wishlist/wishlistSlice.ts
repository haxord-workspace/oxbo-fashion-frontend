import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Product } from '../../types';
import type { RootState } from '../../app/store';
import { wishlistApi } from '../../services/user/wishlist.Api';
import toast from 'react-hot-toast';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const response = await wishlistApi.getWishlist();
    return response.data || response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToWishlistAsync = createAsyncThunk('wishlist/add', async (product: Product, { rejectWithValue }) => {
  console.log("addToWishlistAsync called with:", product);
  try {
    const payload: any = { productId: product.id || (product as any)._id };
    let variantId = product.variants && product.variants[0] ? (product.variants[0]._id || product.variants[0].id) : null;
    
    if (!variantId || variantId === 'default') {
      try {
        console.log("Fetching variants for product:", payload.productId);
        const vRes = await wishlistApi.getProductVariants(payload.productId);
        const variants = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
        if (variants && variants.length > 0) {
          variantId = variants[0]._id || variants[0].id;
        }
      } catch (err) {
        console.error("Failed to fetch variants", err);
      }
    }

    if (variantId && variantId !== 'default') {
      payload.variantId = variantId;
    } else {
      console.warn("addToWishlistAsync: No valid variants found, proceeding with productId only.");
      // We don't reject here because the backend might accept it without variantId
    }
    
    console.log("Sending payload to wishlist API:", payload);
    const response = await wishlistApi.addToWishlist(payload);
    console.log("addToWishlist response:", response);
    // Return the product with the variantId so the reducer stores it correctly
    return { ...product, variantId: payload.variantId };
  } catch (err: any) {
    console.error("addToWishlist error:", err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeFromWishlistAsync = createAsyncThunk('wishlist/remove', async (productId: string, { getState, rejectWithValue }) => {
  console.log("removeFromWishlistAsync called with productId:", productId);
  try {
    const state = getState() as RootState;
    const item = state.wishlist.items.find(i => i.id === productId || (i as any)._id === productId);
    
    // Fallback to productId if variantId isn't found, but try variantId first
    // because the backend endpoint seems to expect the variant ID (404 otherwise).
    const deleteId = (item as any)?.variantId || productId;
    
    console.log("Found item in state, deleting with ID:", deleteId);
    const response = await wishlistApi.removeFromWishlist(deleteId); 
    console.log("removeFromWishlist response:", response);
    return productId; // return the original productId so the reducer can filter it out
  } catch (err: any) {
    console.error("removeFromWishlist error:", err.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        // Map backend items if they are wrapped, else assume they are products
        const data = action.payload;
        if (Array.isArray(data)) {
          state.items = data.map((item: any) => item.product || item.productId || item);
        } else if (data?.items) {
          state.items = data.items.map((item: any) => item.product || item.productId || item);
        } else if (data?.products) {
          console.log("Parsed wishlist products:", data.products);
          state.items = data.products
            .filter((item: any) => item.productId) // Only keep items with valid productId
            .map((item: any) => {
              const product = item.productId || {};
              const variant = item.variantId || {};
              return {
                id: product._id || product.id,
                name: product.name || 'Unknown',
                description: product.description || '',
                price: Number(variant.salePrice || variant.price || product.price || 0),
                mrp: Number(variant.price || product.mrp || 0),
                imageUrl: variant.images?.[0] || product.thumbnail || '',
                category: product.category || product.categoryId || '',
                variants: variant ? [variant] : [],
                variantId: variant._id || variant.id // Attach variantId so we can delete it!
              };
            });
          console.log("Mapped state items:", state.items);
        } else {
          state.items = [];
        }
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        const existingIndex = state.items.findIndex(item => item.id === action.payload.id || (item as any)._id === (action.payload as any)._id);
        if (existingIndex < 0) {
          state.items.push(action.payload);
        }
        toast.success('Added to wishlist');
      })
      .addCase(addToWishlistAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Failed to add to wishlist');
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload && (item as any)._id !== action.payload);
        toast.success('Removed from wishlist');
      })
      .addCase(removeFromWishlistAsync.rejected, (_state, action) => {
        toast.error((action.payload as string) || 'Failed to remove from wishlist');
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.items.length;
export const selectIsWishlisted = (state: RootState, productId: string) => 
  state.wishlist.items.some(item => item.id === productId || (item as any)._id === productId);

export default wishlistSlice.reducer;
