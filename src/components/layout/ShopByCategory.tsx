import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
}

const ShopByCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/categories?limit=4&page=${page}`);
        const data = response.data?.data?.categories || response.data?.categories || response.data?.data || response.data;
        const total = response.data?.data?.total || response.data?.total || 0;
        
        if (Array.isArray(data)) {
          setCategories(data);
          if (total) {
            setHasMore(page * 4 < total);
          } else {
            setHasMore(data.length === 4);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [page]);

  const nextSlide = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const visibleCategories = categories;

  if (isLoading && categories.length === 0) {
    return (
      <section className="w-full py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex justify-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
              <span className="text-primary"> Shop by Category</span>
            </h2>
            <p className="text-gray-500 mt-2">Explore our curated collections for your perfect style.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              disabled={page === 1}
              className="p-2 md:p-3 rounded-full border border-gray-300 hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black disabled:cursor-not-allowed transition-all"
              aria-label="Previous categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              disabled={!hasMore}
              className="p-2 md:p-3 rounded-full border border-gray-300 hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black disabled:cursor-not-allowed transition-all"
              aria-label="Next categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {visibleCategories.map((category) => {
            const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&size=400`;
            const path = `/collections/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}?category=${category._id}`;
            
            return (
              <Link 
                key={category._id} 
                to={path}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-gray-100 block"
              >
                <img 
                  src={category.image || fallbackImage} 
                  alt={category.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                  <h3 className="text-white text-xl md:text-2xl font-bold translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    Explore Collection &rarr;
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
