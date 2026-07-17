import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { initializeAuth, selectAuthInitialized } from './features/auth/authSlice';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Collection from './pages/Collection';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
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
} from './pages/admin/AdminPages';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectAuthInitialized);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-black" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="collections/:categoryId" element={<Collection />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Protected Client Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
        </Route>

        {/* Admin Public Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/:categoryId" element={<AdminCategoryDetails />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="stores" element={<AdminStores />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
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
