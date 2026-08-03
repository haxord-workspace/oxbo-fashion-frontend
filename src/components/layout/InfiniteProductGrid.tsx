import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addToWishlistAsync,
  removeFromWishlistAsync,
  selectIsWishlisted,
} from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../types';

const PAGE_SIZE = 8;

// ─── Product Card ────────────────────────────────────────────────────────────

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const productId = product.id || (product as any)._id;
  const isWishlisted = useAppSelector((state) => selectIsWishlisted(state, productId));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  let images: string[] = [];
  const prod = product as any;
  if (prod.thumbnail) {
    images = [prod.thumbnail, ...(prod.gallery || [])];
  } else if (product.variants && product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0) {
    images = product.variants[0].images || [];
  } else {
    images = [product.imageUrl || '/placeholder.png'];
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlistAsync(productId));
    } else {
      dispatch(addToWishlistAsync({ ...product, id: productId }));
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link to={`/products/${productId}`} className="flex flex-col group cursor-pointer w-full">
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={images[currentImageIndex] || images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Offer Seal */}
        {prod.hasActiveOffer && prod.activeOfferPercentage > 0 && (
          <div className="absolute top-4 -left-10 w-32 bg-red-600 text-white text-[10px] sm:text-xs font-bold py-1 text-center -rotate-45 z-20 shadow-md">
            {prod.activeOfferPercentage}% OFF
          </div>
        )}

        {/* Hover Carousel Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={prevImage}
            className="w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-primary shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button
            onClick={nextImage}
            className="w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-primary shadow-sm"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-primary shadow-sm transition-transform hover:scale-110 z-10"
        >
          <Heart size={16} strokeWidth={2} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      {/* Product Details */}
      <div className="mt-3 flex flex-col items-start text-left">
        <h3 className="text-[11px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="text-[#e35a39]">Rs. {(product.price || 1499).toLocaleString('en-IN')}.00</span>
          {(product.mrp || 1999) > (product.price || 1499) && (
            <span className="text-gray-500 line-through">
              Rs. {(product.mrp || 1999).toLocaleString('en-IN')}.00
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── Product Skeleton ────────────────────────────────────────────────────────

const ProductSkeleton: React.FC = () => (
  <div className="flex flex-col w-full animate-pulse">
    <div className="w-full aspect-[3/4] bg-gray-200" />
    <div className="mt-3 flex flex-col items-start gap-2">
      <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
    </div>
  </div>
);

// ─── Infinite Product Grid ───────────────────────────────────────────────────

interface InfiniteProductGridProps {
  filters?: Record<string, any>;
  onProductCount?: (count: number) => void;
}

const InfiniteProductGrid: React.FC<InfiniteProductGridProps> = ({ filters: externalFilters, onProductCount }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sentinel element at the bottom — observed by IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false); // mirror for use inside observer callback
  const hasMoreRef = useRef(true);

  const filtersKey = JSON.stringify(externalFilters);

  // ── Reset everything when filters change ──────────────────────────────────
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    hasMoreRef.current = true;
    setError(null);
  }, [filtersKey]);

  // ── Fetch a single page of products ──────────────────────────────────────
  const fetchPage = useCallback(
    async (pageNum: number) => {
      if (isFetchingRef.current || !hasMoreRef.current) return;

      isFetchingRef.current = true;
      setIsFetching(true);
      setError(null);

      try {
        const params = {
          ...(externalFilters ?? {}),
          page: pageNum,
          limit: PAGE_SIZE,
        };

        const response: any = await productsApi.getProducts(params);

        // Handle both wrapped and bare array responses
        const rawList: any[] =
          response.data?.products ||
          (Array.isArray(response.data) ? response.data : []);

        // Fetch variants for price/image data
        const enriched = await Promise.all(
          rawList.map(async (p: any) => {
            try {
              const pid = p._id || p.id;
              const vRes = await productsApi.getProductVariants(pid);
              const variants = Array.isArray(vRes.data)
                ? vRes.data
                : Array.isArray(vRes)
                ? vRes
                : [];
              if (variants.length > 0) {
                p.price = variants[0].salePrice || variants[0].price;
                p.mrp = variants[0].costPrice;
                p.variants = variants;
              }
            } catch {
              // keep product without enrichment
            }
            return p;
          })
        );

        // Client-side filtering (color / size / maxPrice)
        let filtered = enriched;
        if (externalFilters?.color) {
          filtered = filtered.filter((p) =>
            p.variants?.some(
              (v: any) =>
                v.color?.toLowerCase() === externalFilters.color.toLowerCase() ||
                v.attributes?.color?.toLowerCase() === externalFilters.color.toLowerCase()
            )
          );
        }
        if (externalFilters?.size) {
          filtered = filtered.filter((p) =>
            p.variants?.some((v: any) =>
              v.sizes?.some((s: any) => s.size === externalFilters.size)
            )
          );
        }
        if (externalFilters?.maxPrice && externalFilters.maxPrice < 5000) {
          filtered = filtered.filter((p) => p.price <= externalFilters.maxPrice);
        }

        // Client-side sort
        if (externalFilters?.sort === 'price') {
          filtered.sort((a, b) =>
            externalFilters.order === 'asc' ? a.price - b.price : b.price - a.price
          );
        }

        setProducts((prev) => {
          const next = pageNum === 1 ? filtered : [...prev, ...filtered];
          onProductCount?.(next.length);
          return next;
        });

        // Determine if there are more pages
        const apiTotalPages = response.data?.totalPages ?? response.totalPages;
        const reachedEnd =
          filtered.length < PAGE_SIZE ||
          (apiTotalPages !== undefined && pageNum >= apiTotalPages);

        if (reachedEnd) {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } catch (err: any) {
        setError('Failed to load products. Tap to retry.');
        // Allow retry by not locking hasMore
      } finally {
        isFetchingRef.current = false;
        setIsFetching(false);
      }
    },
    [filtersKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Load first page whenever filters change ───────────────────────────────
  useEffect(() => {
    fetchPage(1);
    setPage(1);
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load next page ────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    setPage((prev) => {
      const next = prev + 1;
      fetchPage(next);
      return next;
    });
  }, [fetchPage]);

  // ── Intersection Observer ─────────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          loadMore();
        }
      },
      { rootMargin: '200px' } // trigger 200px before sentinel enters viewport
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Loaded products grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-12 md:gap-x-4 md:gap-y-16">
        {products.map((product) => (
          <ProductCard key={product.id || (product as any)._id} product={product} />
        ))}

        {/* Skeleton cards shown while loading the next batch */}
        {isFetching &&
          Array.from({ length: PAGE_SIZE }).map((_, idx) => (
            <ProductSkeleton key={`skeleton-${idx}`} />
          ))}
      </div>

      {/* Error state with retry */}
      {error && !isFetching && (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={loadMore}
            className="px-6 py-2.5 border border-primary text-primary text-sm font-semibold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && !isFetching && products.length > 0 && (
        <p className="text-center text-xs text-gray-400 uppercase tracking-widest mt-12 pb-4">
          — All products loaded —
        </p>
      )}

      {/* Empty state */}
      {!isFetching && products.length === 0 && !error && (
        <p className="text-center text-sm text-gray-500 py-16">No products found.</p>
      )}

      {/* Invisible sentinel — IntersectionObserver watches this */}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
    </section>
  );
};

export default InfiniteProductGrid;
