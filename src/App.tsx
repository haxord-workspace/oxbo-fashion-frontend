import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { initializeAuth, selectAuthInitialized, selectIsAuthenticated } from './features/auth/authSlice';
import { fetchCart } from './features/cart/cartSlice';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import ProductDetail from './pages/user/ProductDetail';
import Collection from './pages/user/Collection';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Contact from './pages/user/Contact';
import Wishlist from './pages/user/Wishlist';
import Profile from './pages/user/Profile';
import Orders from './pages/user/Orders';
import Checkout from './pages/user/Checkout';
import UserNotifications from './pages/user/UserNotifications';
import Terms from './pages/user/Terms';
import Privacy from './pages/user/Privacy';
import ShippingPolicy from './pages/user/ShippingPolicy';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import {
  AdminDashboard,
  AdminProducts,
  AdminCategories,
  AdminCategoryDetails,
  AdminOrders,
  AdminUsers,
  AdminInventory,
  AdminBanners,
  AdminCoupons,
  AdminReports,
  AdminSettings,
  AdminStores,
  AdminBrands,
  AdminNotifications,
  AdminBulkUpload,
  AdminEnquiries,
} from './pages/admin/AdminPages';
import CartPage from './pages/user/CartPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isInitialized, isAuthenticated, dispatch]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="collections/:categoryId" element={<Collection />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="shipping" element={<ShippingPolicy />} />

          {/* Protected Client Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="notifications" element={<UserNotifications />} />
          </Route>
        </Route>

        {/* Admin Public Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'storemanager']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="bulk-upload" element={<AdminBulkUpload />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/:categoryId" element={<AdminCategoryDetails />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="notifications" element={<AdminNotifications />} />
            
            {/* Strictly Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="users" element={<AdminUsers />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="stores" element={<AdminStores />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;
