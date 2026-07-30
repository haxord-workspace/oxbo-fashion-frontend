import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
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
  const [itemsPerView, setItemsPerView] = useState(1);

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
          const normalizedBannerPos = (banner.position || '').toLowerCase().replace(/[-_\s]/g, '');
          const normalizedTargetPos = (position || '').toLowerCase().replace(/[-_\s]/g, '');
          if (normalizedBannerPos !== normalizedTargetPos) return false;

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

  useEffect(() => {
    const handleResize = () => {
      if (position !== 'Carousel') {
        setItemsPerView(1);
        return;
      }
      if (window.innerWidth >= 1280) {
        setItemsPerView(4);
      } else if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  const maxIndex = Math.max(0, banners.length - itemsPerView);

  // Autoplay logic
  useEffect(() => {
    if (banners.length <= itemsPerView) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    }, 5000); // 5 seconds autoplay
    
    return () => clearInterval(interval);
  }, [banners.length, itemsPerView, maxIndex]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
  };

  const heightClass = position === 'Carousel' 
    ? 'h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh]' 
    : 'h-56 md:h-[350px] lg:h-[450px]';

  const isCarousel = position === 'Carousel';
  const isDesktop = itemsPerView > 1;
  const isMarquee = isCarousel && isDesktop;
  
  // For continuous marquee, duplicate banners to ensure seamless loop
  const displayBanners = isMarquee 
    ? [...banners, ...banners, ...banners, ...banners] 
    : banners;
  
  const translationPercent = (banners.length * 100) / itemsPerView;

  if (isLoading) {
    return (
      <div className={`w-full mb-8 ${className}`}>
        <div className={`w-full ${heightClass} bg-gray-200 animate-pulse`}></div>
      </div>
    );
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <div className={`w-full mb-4 ${className}`}>
      <div className={`relative w-full ${heightClass} overflow-hidden group bg-gray-100`}>
        {isMarquee && (
          <style>{`
            @keyframes continuousMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-${translationPercent}%); }
            }
            .animate-marquee {
              animation: continuousMarquee ${banners.length * 6}s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>
        )}
        {/* Slides Container */}
        <div 
          className={`flex w-full h-full ${isMarquee ? 'animate-marquee' : 'transition-transform duration-700 ease-in-out'}`} 
          style={!isMarquee ? { transform: `translateX(-${currentIndex * 100}%)` } : {}}
        >
          {displayBanners.map((banner, index) => {
            const bannerImage = typeof banner.image === 'string' ? banner.image : '';
            
            const slideContent = (
              <div className="w-full h-full relative cursor-pointer overflow-hidden">
                <img 
                  src={bannerImage} 
                  alt={banner.title || 'Banner'} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 transition-colors duration-300" />
              </div>
            );

            // Need flex-shrink-0 block to behave correctly in flex row
            const slideWrapperClasses = "h-full flex-shrink-0 block px-1 md:px-2";

            if (banner.redirectUrl) {
              const isExternal = banner.redirectUrl.startsWith('http');
              return isExternal ? (
                <a key={`${banner._id || banner.id}-${index}`} href={banner.redirectUrl} target="_blank" rel="noopener noreferrer" className={slideWrapperClasses} style={{ width: `${100 / itemsPerView}%` }}>
                  {slideContent}
                </a>
              ) : (
                <Link key={`${banner._id || banner.id}-${index}`} to={banner.redirectUrl} className={slideWrapperClasses} style={{ width: `${100 / itemsPerView}%` }}>
                  {slideContent}
                </Link>
              );
            }

            return (
              <Link key={`${banner._id || banner.id}-${index}`} to="/collections/all-drops" className={slideWrapperClasses} style={{ width: `${100 / itemsPerView}%` }}>
                {slideContent}
              </Link>
            );
          })}
        </div>

        {/* Navigation Arrows (only show if multiple banners and not marquee) */}
        {banners.length > 1 && !isMarquee && (
          <>
            <button 
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm z-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm z-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>
            
            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
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
