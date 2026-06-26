import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import CategoryNav from './CategoryNav';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AnnouncementBar />
      <Navbar />
      <CategoryNav />
      
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
