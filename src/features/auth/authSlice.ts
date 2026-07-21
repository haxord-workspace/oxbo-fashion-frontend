import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import type { RootState } from '../../app/store';
// import Cookies from 'js-cookie';
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
  token: localStorage.getItem('accessToken') || null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_) => {
    try {
      // Just try to fetch the profile. If the HttpOnly cookies are present, this will succeed.
      const response = await authApi.getProfile();
      console.log(response)
      return response.user;
    } catch (err: any) {
      // If it fails, they are not authenticated (e.g., cookies expired or missing)
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken || null;
      state.isLoading = false;
      state.error = null;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    register(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.token = action.payload.accessToken || null;
      state.isLoading = false;
      state.error = null;
      if (action.payload.accessToken) {
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
          state.token = localStorage.getItem('accessToken') || null;
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
export const selectIsAuthenticated = (state: RootState) => !!state.auth?.user;
export const selectAuthInitialized = (state: RootState) => state.auth?.isInitialized;
export const selectUserRole = (state: RootState) => {
  const user = state.auth?.user as any;
  if (!user) return 'user';
  
  const storeManagerRoleId = import.meta.env.VITE_STORE_MANAGER_ROLE_ID;
  const userRoleId = user.roleId?._id || user.roleId?.id || user.roleId || user.role;
  if (storeManagerRoleId && String(userRoleId) === String(storeManagerRoleId)) {
    return 'storemanager';
  }
  
  let role = 'user';
  if (user.role) role = user.role;
  else if (user.roleId?.name) role = user.roleId.name;
  
  const roleStr = String(role).toLowerCase();
  if (roleStr === 'admin' || roleStr.includes('admin') || (user.email && user.email.toLowerCase().includes('admin'))) {
    return 'admin';
  }
  
  return role;
};
export const selectIsAdmin = (state: RootState) => selectUserRole(state) === 'admin';
export const selectIsStoreManager = (state: RootState) => {
  const role = selectUserRole(state);
  const roleStr = String(role).toLowerCase();
  return roleStr === 'storemanager' || roleStr.includes('manager') || roleStr.includes('store');
};

export default authSlice.reducer;
