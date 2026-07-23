import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToWishlistAsync, removeFromWishlistAsync, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { productsApi } from '../../services/productsApi';
import type { Product } from '../../types';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const productId = product.id || (product as any)._id;
  const isWishlisted = useAppSelector(state => selectIsWishlisted(state, productId));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Extract images from backend structure (thumbnail/gallery), or variants, or imageUrl
  let images: string[] = [];
  const prod = product as any;
  if (prod.thumbnail) {
    images = [prod.thumbnail, ...(prod.gallery || [])];
  } else if (product.variants && product.variants.length > 0 && product.variants[0].images?.length > 0) {
    images = product.variants[0].images;
  } else {
    images = [product.imageUrl || '/placeholder.png'];
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/register');
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
    <Link to={`/products/${product.id || (product as any)._id}`} className="flex flex-col group cursor-pointer w-full">
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
        <img 
          src={images[currentImageIndex] || images[0]} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />

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
            <span className="text-gray-500 line-through">Rs. {(product.mrp || 1999).toLocaleString('en-IN')}.00</span>
          )}
        </div>
      </div>
    </Link>
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

const ProductGrid: React.FC<{ filters?: any }> = ({ filters: externalFilters }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const filtersString = JSON.stringify(externalFilters);

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
        
        setProducts(productsWithPrices);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [filtersString]);

  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-12 md:gap-x-4 md:gap-y-16">
        {isLoading 
          ? Array.from({ length: 8 }).map((_, idx) => (
              <ProductSkeleton key={idx} />
            ))
          : products.map(product => (
              <ProductCard key={product.id || (product as any)._id} product={product} />
            ))
        }
      </div>
    </section>
  );
};

export default ProductGrid;
