import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Collection from './pages/Collection';
import Contact from './pages/Contact';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="collections/:categoryId" element={<Collection />} />
              <Route path="contact" element={<Contact />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer />
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;
