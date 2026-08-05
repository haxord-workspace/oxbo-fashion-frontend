import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToWishlistAsync, removeFromWishlistAsync, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../types';
import QuickAddModal from '../common/QuickAddModal';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const productId = product.id || (product as any)._id;
  const isWishlisted = useAppSelector(state => selectIsWishlisted(state, productId));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Extract images from backend structure (thumbnail/gallery), or variants, or imageUrl
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
      dispatch(addToWishlistAsync({
        ...product,
        id: productId // ensure id is set for the thunk
      }));
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent link click
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent link click
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <Link to={`/products/${product.id || (product as any)._id}`} className="flex flex-col group cursor-pointer w-full">
      {/* Image Container */}
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
          className="absolute top-0 right-0 p-3 sm:p-2 sm:top-2 sm:right-2 z-10 group"
          aria-label="Toggle Wishlist"
        >
          <div className="bg-white/80 group-hover:bg-white rounded-full p-2 flex items-center justify-center text-primary shadow-sm transition-transform group-hover:scale-110">
            <Heart size={16} strokeWidth={2} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
          </div>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsQuickAddOpen(true);
          }}
          className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-400/90 text-white flex items-center justify-center hover:bg-gray-500 transition-colors z-20 shadow-sm"
          aria-label="Quick add to cart"
        >
          <span className="text-lg sm:text-xl leading-none font-light mb-0.5">+</span>
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
            <span className="text-gray-500 line-through">Rs. {(product.mrp || 1999).toLocaleString('en-IN')}.00</span>
          )}
        </div>
      </div>
      </Link>
      <QuickAddModal 
        product={product} 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </>
  );
};

const ProductSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-[3/4] bg-gray-200" />
      
      {/* Product Details Skeleton */}
      <div className="mt-3 flex flex-col items-start gap-2">
        <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

const ProductGrid: React.FC<{ filters?: any; onProductCount?: (count: number) => void; pageSize?: number; showPagination?: boolean; className?: string }> = ({ filters: externalFilters, onProductCount, pageSize, showPagination = true, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filtersString = JSON.stringify(externalFilters);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtersString]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const filters = externalFilters ? { ...externalFilters } : {};
        const response: any = await productsApi.getProducts(filters);
        const productsList = response.data?.products || (Array.isArray(response.data) ? response.data : []);
        
        // Fetch variants for all products to get their correct prices
        const productsWithPrices = await Promise.all(
          productsList.map(async (p: any) => {
            try {
              const productId = p._id || p.id;
              const vRes = await productsApi.getProductVariants(productId);
              const variants = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
              if (variants.length > 0) {
                p.price = variants[0].salePrice || variants[0].price;
                p.mrp = variants[0].costPrice;
                p.variants = variants; // Store variants for image extraction too
              }
              return p;
            } catch (err) {
              return p;
            }
          })
        );
        
        let finalProducts = productsWithPrices;
        
        if (externalFilters) {
          if (externalFilters.color) {
             finalProducts = finalProducts.filter(p => p.variants?.some((v: any) => v.color?.toLowerCase() === externalFilters.color.toLowerCase() || v.attributes?.color?.toLowerCase() === externalFilters.color.toLowerCase()));
          }
          if (externalFilters.size) {
             finalProducts = finalProducts.filter(p => p.variants?.some((v: any) => v.sizes?.some((s: any) => s.size === externalFilters.size)));
          }
          if (externalFilters.maxPrice && externalFilters.maxPrice < 5000) {
             finalProducts = finalProducts.filter(p => p.price <= externalFilters.maxPrice);
          }
          if (externalFilters.sort === 'price') {
             finalProducts.sort((a, b) => externalFilters.order === 'asc' ? a.price - b.price : b.price - a.price);
          } else if (externalFilters.sort === 'createdAt') {
             // Assuming newer products are at the end, or we can just reverse if 'desc'
             if (externalFilters.order === 'desc') {
                finalProducts.reverse(); // Simple approximation
             }
          }
        }
        
        setProducts(finalProducts);
        onProductCount?.(finalProducts.length);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [filtersString]);

  // Pagination logic
  const totalPages = pageSize ? Math.ceil(products.length / pageSize) : 1;
  const displayedProducts = pageSize
    ? products.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : products;

  return (
    <section className={`w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 md:pb-16 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-6 md:gap-x-4 md:gap-y-16">
        {isLoading 
          ? Array.from({ length: pageSize ?? 8 }).map((_, idx) => (
              <ProductSkeleton key={idx} />
            ))
          : displayedProducts.map(product => (
              <ProductCard key={product.id || (product as any)._id} product={product} />
            ))
        }
      </div>

      {/* Pagination controls — only shown when showPagination is true, pageSize is set and there are multiple pages */}
      {!isLoading && showPagination && pageSize && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 text-sm font-semibold uppercase tracking-wider text-primary hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 text-sm font-semibold border transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-primary hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 text-sm font-semibold uppercase tracking-wider text-primary hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;

