import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import api from '../../services/api';

interface Category {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
}

const PAGE_SIZE = 8;

const ShopByCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      try {
        const response = await api.get(`/categories?limit=${PAGE_SIZE}&page=${page}`);
        const data = response.data?.data?.categories || response.data?.categories || response.data?.data || response.data;
        const total = response.data?.data?.total || response.data?.total || 0;

        if (cancelled) return;

        if (Array.isArray(data)) {
          setCategories((prev) => (page === 1 ? data : [...prev, ...data]));
          if (total) {
            setHasMore(page * PAGE_SIZE < total);
          } else {
            setHasMore(data.length === PAGE_SIZE);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    };
    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadMore]);

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
    <section className="w-full pt-6 pb-2 md:pb-8 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
            <span className="text-primary"> Shop by Category</span>
          </h2>
          <p className="text-xs md:text-base text-gray-500 mt-1 md:mt-2">Explore our curated collections for your perfect style.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
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

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {isLoadingMore && (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary"></div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;
