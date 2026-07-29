import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const AnnouncementBar: React.FC = () => {
  const [texts, setTexts] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/banners/navbar-offers/public');
        const data = res.data?.data || res.data;
        if (data) {
          setTexts(Array.isArray(data.texts) ? data.texts : []);
          setEnabled(data.enabled ?? true);
        }
      } catch (err) {
        console.error('Failed to fetch navbar offers', err);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    if (texts.length <= 1 || !enabled) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % texts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [texts.length, enabled]);

  if (!enabled || texts.length === 0) return null;

  const handlePrev = () => {
    if (texts.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + texts.length) % texts.length);
  };

  const handleNext = () => {
    if (texts.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % texts.length);
  };

  return (
    <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] font-medium py-2 px-2 sm:px-4 text-center tracking-widest flex justify-center items-center gap-4 sm:gap-12 font-oswald uppercase overflow-hidden">
      <ChevronLeft 
        onClick={handlePrev} 
        size={16} 
        className={`shrink-0 transition-opacity ${texts.length > 1 ? 'cursor-pointer opacity-70 hover:opacity-100' : 'opacity-30'}`} 
        strokeWidth={2} 
      />
      <span className="min-w-[150px] sm:min-w-[200px] transition-all duration-300 ease-in-out truncate px-2">{texts[currentIndex]}</span>
      <ChevronRight 
        onClick={handleNext} 
        size={16} 
        className={`shrink-0 transition-opacity ${texts.length > 1 ? 'cursor-pointer opacity-70 hover:opacity-100' : 'opacity-30'}`} 
        strokeWidth={2} 
      />
    </div>
  );
};

export default AnnouncementBar;
