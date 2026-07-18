import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Reviews from '../../components/layout/review';
import ProductGrid from '../../components/layout/ProductGrid';
import OfferBanner from '../../components/layout/OfferBanner';
import ShopByCategory from '../../components/layout/ShopByCategory';

const Home: React.FC = () => {
  const heroScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = heroScrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    const speed = 0.5;

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += speed;
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden">
      
      {/* Hero Section */}
      <section 
        ref={heroScrollRef}
        className="w-full h-[85vh] flex overflow-x-hidden no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Column 1 */}
        <Link to="/collections/baggy" className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] h-full relative group cursor-pointer border-r-[4px] border-white overflow-hidden snap-center">
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          <img src="/images/model1.png" alt="Baggy Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/10 z-20 transition-opacity duration-500 group-hover:bg-black/0"></div>
        </Link>
        {/* Column 2 */}
        <Link to="/collections/wide" className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] h-full relative group cursor-pointer border-r-[4px] border-white overflow-hidden snap-center">
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          <img src="/images/model2.png" alt="Wide Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/10 z-20 transition-opacity duration-500 group-hover:bg-black/0"></div>
        </Link>
        {/* Column 3 */}
        <Link to="/collections/straight" className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] h-full relative group cursor-pointer border-r-[4px] border-white overflow-hidden snap-center">
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          <img src="/images/model3.png" alt="Straight Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/10 z-20 transition-opacity duration-500 group-hover:bg-black/0"></div>
        </Link>
        
        {/* Duplicate 1 */}
        <Link to="/collections/baggy" className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] h-full relative group cursor-pointer border-r-[4px] border-white overflow-hidden snap-center">
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          <img src="/images/model1.png" alt="Baggy Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/10 z-20 transition-opacity duration-500 group-hover:bg-black/0"></div>
        </Link>
        {/* Duplicate 2 */}
        <Link to="/collections/wide" className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] h-full relative group cursor-pointer border-r-[4px] border-white overflow-hidden snap-center">
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          <img src="/images/model2.png" alt="Wide Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/10 z-20 transition-opacity duration-500 group-hover:bg-black/0"></div>
        </Link>
        {/* Duplicate 3 */}
        <Link to="/collections/straight" className="min-w-full sm:min-w-[50%] md:min-w-[33.333%] h-full relative group cursor-pointer border-r-[4px] border-white overflow-hidden snap-center">
          <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
          <img src="/images/model3.png" alt="Straight Collection" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105 z-10" />
          <div className="absolute inset-0 bg-black/10 z-20 transition-opacity duration-500 group-hover:bg-black/0"></div>
        </Link>
      </section>

      {/* Shop By Category Section */}
      <ShopByCategory />

      {/* Offer Banner Section */}
      <OfferBanner />

      {/* Product Grid Section */}
      <ProductGrid />

      {/* Reviews Section */}
      <Reviews />

    </div>
  );
};

export default Home;
