import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, BadgeCheck } from 'lucide-react';

// Mock data based on the screenshot
const mockReviews = [
  {
    id: 1,
    image: '/images/model1.png', 
    text: "The best straight fit pant i ever received You can buy this pany with eyes closed",
    rating: 5,
    author: "Areeb .",
    product: "CLEAN DARK STRAIGHT"
  },
  {
    id: 2,
    image: '/images/model2.png',
    text: "W jeans man but there is a problem with the waist Like i have 3 jeans in which 2 have 30..",
    rating: 4,
    author: "Ayan .",
    product: "BRIX GREEN BAGGY"
  },
    {
    id: 1,
    image: '/images/model1.png', 
    text: "The best straight fit pant i ever received You can buy this pany with eyes closed",
    rating: 5,
    author: "Areeb .",
    product: "CLEAN DARK STRAIGHT"
  },
  {
    id: 2,
    image: '/images/model2.png',
    text: "W jeans man but there is a problem with the waist Like i have 3 jeans in which 2 have 30..",
    rating: 4,
    author: "Ayan .",
    product: "BRIX GREEN BAGGY"
  },
  {
    id: 3,
    image: '/images/model3.png',
    text: "Good, loved it.",
    rating: 5,
    author: "Arpit Sarma",
    product: "ELIX PEARL BRACELET"
  },
  {
    id: 4,
    image: '/images/model1.png',
    text: "Everything was great. The finishing was ok",
    rating: 4,
    author: "Anthny",
    product: "IRO DARK WASH"
  }
];

const Reviews: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full bg-white py-16">
      <h2 className="text-center text-lg sm:text-xl font-oswald uppercase tracking-widest mb-6 text-primary">
        Reviews
      </h2>
      
      {/* Outer Wrapper for positioning arrows outside */}
      <div className="relative max-w-7xl mx-auto px-12">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-primary hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={36} strokeWidth={1.5} />
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollRef} 
          className="flex overflow-x-auto gap-4 no-scrollbar pb-4 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockReviews.map((review) => (
            <div 
              key={review.id} 
              className="w-full sm:w-[calc(50%-8px)] md:w-[calc(25%-12px)] flex-shrink-0 flex flex-col rounded-b-[8px] overflow-hidden snap-start"
            >
              {/* Product Image */}
              <div className="h-[350px] w-full bg-gray-100 relative">
                <img 
                  src={review.image} 
                  alt={review.product} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Review Content */}
              <div className="bg-[#e9e9e9] p-6 flex flex-col items-center text-center flex-1">
                <p className="text-[13px] leading-tight text-gray-800 mb-5 h-[40px] flex items-center justify-center">
                  {review.text}
                </p>
                
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={i < review.rating ? "fill-primary text-primary" : "text-primary"} 
                      strokeWidth={1.5}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 font-bold text-primary mb-2 text-sm">
                  {review.author}
                  <BadgeCheck size={16} className="fill-primary text-[#e9e9e9]" />
                </div>

                <div className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mt-1">
                  {review.product}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-primary hover:opacity-70 transition-opacity"
        >
          <ChevronRight size={36} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
};

export default Reviews;
