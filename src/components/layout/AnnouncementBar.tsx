import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] font-medium py-2 px-4 text-center tracking-widest flex justify-center items-center gap-12 font-oswald uppercase">
      <ChevronLeft size={16} className="hidden md:inline cursor-pointer opacity-70 hover:opacity-100 transition-opacity" strokeWidth={2} />
      <span>FREE SHIPPING ON EVERY ORDERS</span>
      <ChevronRight size={16} className="hidden md:inline cursor-pointer opacity-70 hover:opacity-100 transition-opacity" strokeWidth={2} />
    </div>
  );
};

export default AnnouncementBar;
