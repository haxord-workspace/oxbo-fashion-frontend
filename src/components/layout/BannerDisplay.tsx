import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminBannerApi, type Banner } from '../../services/admin/adminBanner.Api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerDisplayProps {
  position: string;
  className?: string;
}

const BannerDisplay: React.FC<BannerDisplayProps> = ({ position, className = '' }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Pass a high limit to get all active banners
        const response = await adminBannerApi.getBanners({ limit: 100 });
        const allBanners: Banner[] = response.data?.data || response.data || [];
        
        const currentDate = new Date();

        const filteredBanners = allBanners.filter(banner => {
          if (!banner.isActive) return false;
          if (banner.isDeleted === true) return false;
          if (banner.position !== position) return false;

          if (banner.startDate) {
            const start = new Date(banner.startDate);
            if (start > currentDate) return false;
          }
          if (banner.endDate) {
            const end = new Date(banner.endDate);
            if (end < currentDate) return false;
          }
          return true;
        });

        filteredBanners.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setBanners(filteredBanners);
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setError("Failed to load banners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [position]);

  // Autoplay logic
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // 5 seconds autoplay
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  if (isLoading) {
    return (
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 ${className}`}>
        <div className="w-full h-56 md:h-[350px] lg:h-[450px] bg-gray-200 animate-pulse rounded-2xl shadow-sm"></div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 ${className}`}>
      <div className="relative w-full h-56 md:h-[350px] lg:h-[450px] rounded-2xl shadow-lg overflow-hidden group bg-gray-100">
        {/* Slides Container */}
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-in-out" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => {
            const bannerImage = typeof banner.image === 'string' ? banner.image : '';
            
            const slideContent = (
              <div className="w-full h-full relative cursor-pointer overflow-hidden">
                <img 
                  src={bannerImage} 
                  alt={banner.title || 'Banner'} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300" />
              </div>
            );

            // Need flex-shrink-0 block to behave correctly in flex row
            const slideWrapperClasses = "w-full h-full flex-shrink-0 block";

            if (banner.redirectUrl) {
              const isExternal = banner.redirectUrl.startsWith('http');
              return isExternal ? (
                <a key={banner._id || banner.id} href={banner.redirectUrl} target="_blank" rel="noopener noreferrer" className={slideWrapperClasses}>
                  {slideContent}
                </a>
              ) : (
                <Link key={banner._id || banner.id} to={banner.redirectUrl} className={slideWrapperClasses}>
                  {slideContent}
                </Link>
              );
            }

            return (
              <div key={banner._id || banner.id} className={slideWrapperClasses}>
                {slideContent}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows (only show if multiple banners) */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm z-10 focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm z-10 focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>
            
            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full focus:outline-none ${
                    idx === currentIndex 
                      ? 'w-6 h-2 bg-white' 
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerDisplay;
