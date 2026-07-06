import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';
import ordersReducer from '../features/orders/ordersSlice';
import uiReducer from '../features/ui/uiSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';

// Custom storage to bypass redux-persist import issues with Vite
const customStorage = {
  getItem: (key: string) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productsReducer,
  orders: ordersReducer,
  ui: uiReducer,
  wishlist: wishlistReducer,
});

const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['cart', 'auth', 'wishlist'], // Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
