import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import type { RootState } from '../../app/store';
import Cookies from 'js-cookie';
import { authApi, type AuthResponse } from '../../services/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get('accessToken') || null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');
      if (!token && !refreshToken) return null;
      
      const response = await authApi.getProfile();
      return response.user;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to initialize auth');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isLoading = false;
      state.error = null;
      Cookies.set('accessToken', action.payload.accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', action.payload.refreshToken, { secure: true, sameSite: 'strict' });
    },
    register(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isLoading = false;
      state.error = null;
      Cookies.set('accessToken', action.payload.accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', action.payload.refreshToken, { secure: true, sameSite: 'strict' });
    },
    logout(state) {
      state.user = null;
      state.token = null;
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    },
    fetchCurrentUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    updateUser(state, action: PayloadAction<User>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.token = Cookies.get('accessToken') || null;
        } else {
          state.user = null;
          state.token = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { login, register, logout, fetchCurrentUser, updateUser, setAuthLoading, setAuthError } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth?.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth?.token;
export const selectAuthInitialized = (state: RootState) => state.auth?.isInitialized;
export const selectUserRole = (state: RootState) => state.auth?.user?.role || 'user';
export const selectIsAdmin = (state: RootState) => state.auth?.user?.role === 'admin';

export default authSlice.reducer;
