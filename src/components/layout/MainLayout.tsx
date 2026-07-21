import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import CategoryNav from './CategoryNav';
import Footer from './Footer';
import CartDrawer from '../../features/cart/CartDrawer';
import MobileMenuDrawer from './MobileMenuDrawer';
import MobileBottomNav from './MobileBottomNav';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden pb-[60px] sm:pb-0">
      <AnnouncementBar />
      <Navbar />
      <CategoryNav />
      
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      
      <Footer />
      <CartDrawer />
      <MobileMenuDrawer />
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
