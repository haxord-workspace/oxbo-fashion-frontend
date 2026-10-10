import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import { Minus, Plus, Link as LinkIcon, ShieldCheck, Truck, MessageCircle, Heart, Star, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCartAsync } from '../../features/cart/cartSlice';
import { toggleCart } from '../../features/ui/uiSlice';
import { addToWishlistAsync, removeFromWishlistAsync, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import Accordion from '../../components/common/Accordion';
import SizeChartModal from '../../components/common/SizeChartModal';

import { productsApi } from '../../services/productsApi';
import { userReviewsApi } from '../../services/user/reviews.Api';
import type { Product } from '../../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const isWishlisted = useAppSelector(state => selectIsWishlisted(state, product?.id || (product as any)?._id || ''));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  const [reviewPage, setReviewPage] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const handleNextReviews = () => {
    if ((reviewPage + 1) * 5 < reviews.length) {
      setReviewPage(p => p + 1);
    }
  };

  const handlePrevReviews = () => {
    if (reviewPage > 0) {
      setReviewPage(p => p - 1);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response: any = await productsApi.getProductById(id);
        let actualProduct = response.data?.product || response.data || response;
        if (actualProduct?.products && Array.isArray(actualProduct.products)) {
          actualProduct = actualProduct.products.find((p: any) => p._id === id || p.id === id) || actualProduct.products[0];
        } else if (Array.isArray(actualProduct)) {
          actualProduct = actualProduct.find((p: any) => p._id === id || p.id === id) || actualProduct[0];
        }
        
        // If the backend didn't populate the variants (e.g., they are just string IDs) or they are missing,
        // we still need to fetch the full variant objects.
        if (!actualProduct.variants || !actualProduct.variants[0] || typeof actualProduct.variants[0] === 'string') {
          try {
            const variantsResponse: any = await productsApi.getProductVariants(id);
            const actualVariants = variantsResponse.data?.variants || variantsResponse.data || variantsResponse;
            if (Array.isArray(actualVariants) && actualVariants.length > 0) {
              actualProduct.variants = actualVariants;
            }
          } catch (variantErr) {
            console.error('Failed to fetch variants', variantErr);
          }
        }
        
        const related: any = await productsApi.getProducts({ category: actualProduct?.category || actualProduct?.categoryId, limit: 4 });
        const relatedList = related.data?.products || (Array.isArray(related.data) ? related.data : []) || [];
        
        setProduct(actualProduct);
        setRelatedProducts(relatedList.filter((p: any) => p.id !== id && p._id !== id).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch product details', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const fetchReviews = async () => {
    if (!id) return;
    setIsLoadingReviews(true);
    try {
      const data: any = await userReviewsApi.getProductReviews(id);
      let reviewList = [];
      if (Array.isArray(data)) {
        reviewList = data;
      } else if (data?.reviews && Array.isArray(data.reviews)) {
        reviewList = data.reviews;
      } else if (data?.data && Array.isArray(data.data)) {
        reviewList = data.data;
      } else if (data?.data?.data && Array.isArray(data.data.data)) {
        reviewList = data.data.data;
      } else if (data?.data?.reviews && Array.isArray(data.data.reviews)) {
        reviewList = data.data.reviews;
      }
      setReviews(reviewList);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Helper to extract color and size robustly, handling different backend serialization formats
  const getVariantColor = (v: any) => v?.attributes?.color || v?.color || v?.['attributes[color]'] || '';
  const getVariantSize = (v: any) => v?.attributes?.size || v?.size || v?.['attributes[size]'] || (v?.sku ? v.sku.split('-').slice(2).join('-') : '');

  // Derived state based on variants
  const uniqueColors = Array.from(new Set(product?.variants?.map(getVariantColor).filter(Boolean))) as string[];
  
  // Also match empty colors if selectedColor is empty
  const variantsForColor = product?.variants?.filter((v: any) => getVariantColor(v) === selectedColor) || [];
  
  // Handle both flat structure (v.attributes.size) and nested structure (v.sizes)
  let availableSizes: { size: string, stock: number, variantId?: string }[] = [];
  if (variantsForColor.length > 0 && Array.isArray(variantsForColor[0].sizes)) {
    // Old nested structure
    availableSizes = variantsForColor[0].sizes;
  } else {
    // New flat structure
    availableSizes = variantsForColor.map((v: any) => ({
      size: getVariantSize(v),
      stock: v.stock !== undefined ? v.stock : (v.quantity !== undefined ? v.quantity : (v.status === 'active' ? 10 : 0)),
      variantId: v._id || v.id
    })).filter(s => s.size);
  }

  // Sort available sizes logically (numeric or standard alphabetic sizes)
  const sizeOrder: Record<string, number> = {
    'xxs': 1, 'xs': 2, 's': 3, 'm': 4, 'l': 5, 'xl': 6, 'xxl': 7, '2xl': 7, '3xl': 8, '4xl': 9
  };

  availableSizes.sort((a, b) => {
    const aLower = String(a.size || '').toLowerCase();
    const bLower = String(b.size || '').toLowerCase();
    
    // Check if both are in standard size order
    if (sizeOrder[aLower] && sizeOrder[bLower]) {
      return sizeOrder[aLower] - sizeOrder[bLower];
    }
    
    // Check if both are numeric
    const aNum = parseFloat(a.size);
    const bNum = parseFloat(b.size);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum; // Ascending numerical sort
    }
    
    // Default alphabetical sort
    return String(a.size).localeCompare(String(b.size));
  });

  const activeVariant = variantsForColor.find((v: any) => getVariantSize(v) === selectedSize) || variantsForColor[0] || product?.variants?.[0];
  
  let fallbackImages = ['/placeholder.png'];
  if (product?.thumbnail) {
    fallbackImages = [product.thumbnail, ...(product.gallery || [])];
  } else if (product?.imageUrl) {
    fallbackImages = [product.imageUrl];
  }

  useEffect(() => {
    if (selectedColor && product?.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find((v: any) => getVariantColor(v) === selectedColor);
      if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
        setCurrentImages(matchingVariant.images);
      } else {
        setCurrentImages(fallbackImages);
      }
      setSelectedImage(0);
    }
  }, [selectedColor, product]);

  const displayImages = currentImages.length > 0 ? currentImages : fallbackImages;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwipingTouch = useRef(false);

  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const isPointerDown = useRef(false);

  const handlePrevImage = () => {
    if (displayImages.length <= 1) return;
    setSelectedImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (displayImages.length <= 1) return;
    setSelectedImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsZoomed(false);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwipingTouch.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipingTouch.current || touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - endX;
    const deltaY = (touchStartY.current ?? 0) - endY;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) && displayImages.length > 1) {
      if (deltaX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    isSwipingTouch.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (e.button !== 0) return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isPointerDown.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !isPointerDown.current || pointerStartX.current === null) return;
    const deltaX = pointerStartX.current - e.clientX;
    const deltaY = (pointerStartY.current ?? 0) - e.clientY;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) && displayImages.length > 1) {
      if (deltaX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    isPointerDown.current = false;
    pointerStartX.current = null;
    pointerStartY.current = null;
  };

  let currentStock = 0;
  if (availableSizes.length > 0) {
    const sizeObj = availableSizes.find(s => s.size === selectedSize);
    currentStock = sizeObj ? sizeObj.stock : 0;
  } else if (activeVariant) {
    currentStock = activeVariant.stock !== undefined ? activeVariant.stock : (activeVariant.quantity !== undefined ? activeVariant.quantity : 0);
  } else if (product) {
    currentStock = (product as any).stock !== undefined ? (product as any).stock : ((product as any).quantity !== undefined ? (product as any).quantity : 10);
  }

  // availableStock is the primary source of truth for product-level stock
  const productAvailableStock: number = (product as any)?.availableStock ?? 0;

  // Detect if the selected size/variant has an *explicit* stock value from the API.
  // When the API omits the stock field entirely, currentStock falls to a default (not
  // a real 0), so we can't trust it as an out-of-stock signal unless it's explicit.
  const activeVariantHasExplicitStock = availableSizes.length > 0
    ? (variantsForColor.find((v: any) => getVariantSize(v) === selectedSize)?.stock !== undefined ||
       variantsForColor.find((v: any) => getVariantSize(v) === selectedSize)?.quantity !== undefined)
    : (activeVariant?.stock !== undefined || activeVariant?.quantity !== undefined);

  // Effective stock for display:
  // - Selected variant has explicit stock data → use the variant's own stock
  // - Otherwise fall back to product-level availableStock
  const effectiveStock: number = activeVariantHasExplicitStock ? currentStock : productAvailableStock;

  // Buttons are disabled based on the same effective stock used for the stock
  // message above — trust the variant's explicit stock when it has one, otherwise
  // fall back to product-level availableStock. Keeping this in sync with
  // stockMessageContent avoids the button disagreeing with the displayed stock.
  const isVariantOutOfStock = effectiveStock <= 0;

  // Stock message logic
  const stockMessageContent: string | null =
    effectiveStock === 0
      ? 'Insufficient Stock'
      : effectiveStock > 0 && effectiveStock <= 10
      ? `Available Stock: ${effectiveStock}`
      : null; // > 10 → no message

  // Update size if current size is out of stock in new color
  useEffect(() => {
    if (availableSizes.length > 0) {
      const currentSizeStock = availableSizes.find(s => s.size === selectedSize)?.stock || 0;
      if (currentSizeStock === 0) {
        const firstAvailable = availableSizes.find(s => s.stock > 0);
        if (firstAvailable) setSelectedSize(firstAvailable.size);
      }
    }
  }, [selectedColor, availableSizes, selectedSize]);

  // Set default color + size whenever the product loads/changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      // Support multiple structures for color
      const firstColor = getVariantColor(firstVariant);
      setSelectedColor(firstColor);
      // Support multiple structures for size
      const firstSize = getVariantSize(firstVariant);
      if (firstSize) {
        setSelectedSize(firstSize);
      } else if (firstVariant.sizes && firstVariant.sizes.length > 0) {
        setSelectedSize(firstVariant.sizes[0].size || '');
      }
    }
  }, [id, product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!product) return;

    // Find the selected variant to pass its ID
    let variantId = 'default';
    if (activeVariant) {
      variantId = activeVariant._id || activeVariant.id || 'default';
    }

    dispatch(addToCartAsync({
      product: {
        ...product,
        id: product.id || (product as any)._id,
        imageUrl: displayImages[0],
        price: Number(activeVariant?.salePrice || activeVariant?.price || product.price || 1499),
        mrp: Number(activeVariant?.price || product.price)
      },
      quantity,
      selectedColor,
      selectedSize,
      variantId
    }));
    dispatch(toggleCart());
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!product) return;

    // Find the selected variant to pass its ID
    let variantId = 'default';
    if (activeVariant) {
      variantId = activeVariant._id || activeVariant.id || 'default';
    }

    dispatch(addToCartAsync({
      product: {
        ...product,
        id: product.id || (product as any)._id,
        imageUrl: displayImages[0],
        price: Number(activeVariant?.salePrice || activeVariant?.price || product.price || 1499),
        mrp: Number(activeVariant?.price || product.price)
      },
      quantity,
      selectedColor,
      selectedSize,
      variantId
    }));
    navigate('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.name || 'Check out this product';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!product) return;
    
    if (isWishlisted) {
      dispatch(removeFromWishlistAsync(product.id || (product as any)._id));
    } else {
      dispatch(addToWishlistAsync({
        ...product,
        id: product.id || (product as any)._id,
        imageUrl: displayImages[0]
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1920px] mx-auto bg-white animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="py-4 px-4 sm:px-8 border-b border-gray-100 flex gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>

        <div className="flex flex-col lg:flex-row px-4 sm:px-8 py-8 lg:py-12 gap-8 lg:gap-16">
          {/* Left Column Skeleton: Images */}
          <div className="w-full lg:w-2/5 flex flex-col gap-4">
            <div className="w-full aspect-[4/4] bg-gray-200 rounded-md"></div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton: Details */}
          <div className="w-full lg:w-2/5 flex flex-col pt-4">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>
            
            <div className="h-4 w-64 bg-gray-200 rounded mb-8"></div>
            <div className="h-16 w-full bg-gray-200 rounded mb-6"></div>
            
            <div className="mb-6">
              <div className="h-4 w-16 bg-gray-200 rounded mb-3"></div>
              <div className="flex gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200"></div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-12 h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-32 h-14 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="w-full h-14 bg-gray-200 rounded-xl mb-10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        Product not found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto bg-white">
      {/* Breadcrumb / Top Bar */}
      {/* <div className="text-xs text-gray-500 py-4 px-4 sm:px-8 border-b border-gray-100 flex flex-wrap gap-2 items-center">
  
        {((product as any).categoryId?.name || (product as any).category?.name) && (
          <>
            <span className="shrink-0 uppercase">{(product as any).categoryId?.name || (product as any).category?.name}</span>
            <span className="shrink-0">/</span>
          </>
        )}
        {((product as any).subCategoryId?.name || (product as any).subCategory?.name) && (
          <>
            <span className="shrink-0 uppercase">{(product as any).subCategoryId?.name || (product as any).subCategory?.name}</span>
            <span className="shrink-0">/</span>
          </>
        )}
       
      </div> */}

      <div className="flex flex-col lg:flex-row px-4 sm:px-8 py-2 lg:py-12 gap-8 lg:gap-16">

        {/* Left Column: Images */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <div 
            className="w-full aspect-[4/4] bg-gray-100 overflow-hidden relative cursor-crosshair group select-none touch-pan-y"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => { setIsZoomed(false); isPointerDown.current = false; }}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {/* Sliding Image Track */}
            <div 
              className="flex h-full w-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${selectedImage * 100}%)` }}
            >
              {displayImages.map((img, idx) => (
                <div key={idx} className="w-full h-full shrink-0 relative overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-200 ease-out ${
                      isZoomed && selectedImage === idx ? 'scale-[2]' : 'scale-100'
                    }`}
                    style={isZoomed && selectedImage === idx ? zoomStyle : { transformOrigin: 'center center' }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            
            {/* Offer Seal — prefer per-variant discountPercentage, fall back to product-level activeOfferPercentage */}
            {(() => {
              const discount = (activeVariant as any)?.discountPercentage ?? (product as any)?.activeOfferPercentage ?? 0;
              return discount > 0 ? (
                <div className="absolute top-5 -left-12 w-40 bg-red-600 text-white text-xs sm:text-sm font-bold py-1.5 text-center -rotate-45 z-20 shadow-md pointer-events-none">
                  {discount}% OFF
                </div>
              ) : null;
            })()}

            {/* Previous & Next Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all sm:opacity-0 sm:group-hover:opacity-100 z-20 backdrop-blur-sm active:scale-95"
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md transition-all sm:opacity-0 sm:group-hover:opacity-100 z-20 backdrop-blur-sm active:scale-95"
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </button>

                {/* Indicator Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full pointer-events-auto">
                  {displayImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                      aria-label={`Go to image ${idx + 1}`}
                      className={`transition-all rounded-full ${
                        selectedImage === idx
                          ? 'w-4 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/90'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Wishlist + Share buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 cursor-default opacity-100 transition-opacity">
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm transition-colors"
                  title="Share this product"
                >
                  <Share2 size={20} strokeWidth={1.5} className="text-gray-700" />
                </button>
                {shareCopied && (
                  <span className="absolute -bottom-7 right-0 text-[10px] whitespace-nowrap bg-gray-800 text-white px-2 py-0.5 rounded">
                    Copied!
                  </span>
                )}
              </div>
              <button
                onClick={handleToggleWishlist}
                className="p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-sm transition-colors"
                title="Toggle Wishlist"
              >
                <Heart size={20} strokeWidth={1.5} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="w-full lg:w-2/5 flex flex-col relative">
       
          {(() => {
            const brandName = (product as any).brandId?.name || product.brand || (product as any).brand;
            return brandName ? (
              <p className="text-xs tracking-widest mb-2 pr-12">
                <span className="font-semibold text-primary uppercase">{brandName}</span>
              </p>
            ) : null;
          })()}
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide mb-4 break-words pr-12">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            {(() => {
              const currentPrice = Number(activeVariant?.salePrice || activeVariant?.price || product.price || 1499);
              const originalPrice = Number(activeVariant?.costPrice || product.price || 0);
              return (
                <>
                  <span className="text-xl text-[#e35a39]">Rs. {currentPrice.toLocaleString('en-IN')}.00</span>
                  {originalPrice > currentPrice && (
                    <span className="text-sm text-gray-500 line-through">Rs. {originalPrice.toLocaleString('en-IN')}.00</span>
                  )}
                </>
              );
            })()}
          </div>


          {/* Color Selection */}
          {uniqueColors.length > 0 && (
            <div className="mb-5">
              <span className="text-sm block mb-2">Selected Color: <span className="font-semibold">{selectedColor}</span></span>
              <div className="flex gap-2 overflow-x-auto py-1 px-1 -mx-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {uniqueColors.map((colorStr, idx) => {
                  const variant = product?.variants?.find((v: any) => getVariantColor(v) === colorStr);
                  const imageUrl = variant?.images?.[0] || (product as any)?.thumbnail || (product as any)?.imageUrl || '/placeholder.png';
                  const isSelected = selectedColor === colorStr;
                  return (
                    <button
                      key={colorStr || idx}
                      onClick={() => setSelectedColor(colorStr)}
                      title={colorStr}
                      className="shrink-0 flex flex-col items-center gap-1 focus:outline-none"
                    >
                      <div className={`w-[62px] h-[62px] rounded-lg overflow-hidden bg-gray-100 transition-all ${
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-black'
                          : 'ring-1 ring-gray-200 hover:ring-gray-400'
                      }`}>
                        <img src={imageUrl} alt={colorStr} className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-[10px] leading-tight max-w-[62px] truncate text-center ${
                        isSelected ? 'font-semibold text-black' : 'text-gray-500'
                      }`}>{colorStr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold">Select Size</span>
              <button 
                className="text-xs text-primary underline underline-offset-2 flex items-center gap-1 hover:opacity-70 transition-opacity"
                onClick={() => setIsSizeChartOpen(true)}
              >
                Size Chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.length > 0 ? (
                availableSizes.map(sizeData => {
                  const size = sizeData.size;
                  const isOutOfStock = sizeData.stock === 0;

                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`relative min-w-[3rem] px-3 h-10 rounded-full border text-sm font-medium transition-all overflow-hidden ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : isOutOfStock
                            ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {size}
                      {isOutOfStock && (
                        <div className="absolute inset-0 w-full h-full pointer-events-none">
                          <div className="absolute top-1/2 left-[-10%] w-[120%] h-px bg-gray-200 transform -translate-y-1/2 -rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 py-2">One Size</div>
              )}
            </div>
            {stockMessageContent !== null && (
              <p className="text-red-600 text-sm mt-2 font-bold">
                {stockMessageContent}
              </p>
            )}
          </div>

          {/* Quantity — hidden on mobile (sticky bar handles it) */}
          <div className="hidden sm:flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">Qty:</span>
            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
              <button
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-10 text-center focus:outline-none text-sm font-medium bg-transparent"
              />
              <button
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Cart + Buy Now — hidden on mobile (sticky bar handles it) */}
          <div className="hidden sm:flex gap-3 mb-10">
            <button
              onClick={handleAddToCart}
              disabled={isVariantOutOfStock}
              className={`flex-1 rounded-xl border-2 font-semibold text-sm py-4 transition-all ${
                isVariantOutOfStock
                  ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'border-primary text-primary hover:bg-primary hover:text-white'
              }`}
            >
              {isVariantOutOfStock ? 'Out of Stock' : 'Add to cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isVariantOutOfStock}
              className={`flex-1 rounded-xl font-semibold text-sm py-4 transition-all ${
                isVariantOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#f5a623] text-white hover:bg-[#e09510] shadow-sm'
              }`}
            >
              {isVariantOutOfStock
                ? 'Out of Stock'
                : `Buy Now · Rs. ${(Number(activeVariant?.salePrice || activeVariant?.price || product.price || 0) * quantity).toLocaleString('en-IN')}`
              }
            </button>
          </div>

          {/* Accordions */}
          <div className="border-t border-gray-200">
            <Accordion title="Description">
              <div className="whitespace-pre-line text-gray-700 text-sm">
                {product?.description || 'No description available.'}
              </div>
            </Accordion>
            <Accordion title="Shipping and Returns">
              {/* <p>Free standard shipping on all orders over Rs. 2,999.00.</p> */}
              <p className="mt-2">Returns accepted within 7 days of delivery. Items must be unworn with original tags attached.</p>
            </Accordion>
          </div>

          <div className="mt-8 flex items-center flex-wrap gap-4 text-sm text-gray-500">
            <span>Share:</span>
            <div className="flex flex-wrap gap-2">
              {['f', 'X', 'P', 'W', 'M'].map(icon => (
                <button key={icon} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  {icon === 'W' ? <MessageCircle size={14} /> : icon === 'M' ? <LinkIcon size={14} /> : icon}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="px-4 sm:px-8 pt-8 pb-4 lg:pt-16 lg:pb-8 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl">Customer Reviews</h2>
          {reviews.length > 5 && (
            <div className="flex gap-2">
              <button 
                onClick={handlePrevReviews} 
                disabled={reviewPage === 0}
                className={`p-3 rounded-full border transition-colors ${reviewPage === 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextReviews} 
                disabled={(reviewPage + 1) * 5 >= reviews.length}
                className={`p-3 rounded-full border transition-colors ${(reviewPage + 1) * 5 >= reviews.length ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {isLoadingReviews ? (
          <div className="text-gray-500 animate-pulse">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet for this product.</div>
        ) : (
          <div className="relative">
            <div 
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reviews.slice(reviewPage * 5, (reviewPage + 1) * 5).map((review, idx) => (
                <div key={review._id || review.id || idx} className="border border-gray-100 p-6 rounded-2xl min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] shrink-0 snap-start bg-gray-50 flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={star <= (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 truncate">{review.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{review.review || review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {review.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="Review" className="w-16 h-16 object-cover border border-gray-200 rounded shrink-0" />
                      ))}
                    </div>
                  )}
                  <div className="mt-auto">
                    {(() => {
                      const reviewerName = review.userId?.firstName 
                        ? `${review.userId.firstName} ${review.userId.lastName || ''}`.trim() 
                        : review.user?.name || review.user?.firstName || review.reviewerName || review.author || 'Anonymous';
                      return (
                        <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
                          By <span className="font-medium text-gray-600">{reviewerName}</span> on {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* You May Also Like Section */}
      <div className="px-4 sm:px-8 pt-4 pb-8 lg:pt-8 lg:pb-16 border-t border-gray-100">
        <h2 className="text-xl sm:text-2xl lg:text-3xl mb-6 lg:mb-8">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map(rp => (
            <Link key={rp.id || (rp as any)._id} to={`/products/${rp.id || (rp as any)._id}`} className="flex flex-col group">
              <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                <img
                  src={(rp as any).thumbnail || rp.imageUrl || '/placeholder.png'}
                  alt={rp.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-1">{rp.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#e35a39]">Rs. {(rp.price || 0).toLocaleString('en-IN')}.00</span>
                {rp.mrp && rp.mrp > rp.price && (
                  <span className="text-gray-500 line-through">Rs. {rp.mrp.toLocaleString('en-IN')}.00</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Guarantees Footer */}
      <div className="px-4 sm:px-8 py-8 lg:py-16 bg-gray-50 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <Truck className="w-8 h-8 mb-4" />
            <h4 className="font-bold mb-2">Free Shipping</h4>
            <p className="text-sm text-gray-500">Fast and Free Shipping on Eligible Orders.</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-8 h-8 mb-4" />
            <h4 className="font-bold mb-2">Guaranteed Checkout</h4>
            <p className="text-sm text-gray-500">Secure and Protected checkout for a safe shopping experience.</p>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="w-8 h-8 mb-4" />
            <h4 className="font-bold mb-2">Support Online</h4>
            <p className="text-sm text-gray-500">Our Support team is Available Anytime to Assist you.</p>
          </div>
        </div>
      </div>

      <SizeChartModal 
        isOpen={isSizeChartOpen} 
        onClose={() => setIsSizeChartOpen(false)} 
        defaultTab={
          ((product as any)?.categoryId?.name || product?.category || '').toLowerCase().match(/jean|pant|bottom|trouser|short/i)
            ? 'bottoms' 
            : product?.name?.toLowerCase().includes('long') 
              ? 'long-sleeve' 
              : 'tops'
        }
      />
      {/* Mobile sticky bottom CTA — replaces the bottom nav on this page */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 pb-safe flex gap-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <button
          onClick={handleAddToCart}
          disabled={isVariantOutOfStock}
          className={`flex-1 rounded-xl border-2 font-semibold text-sm py-3.5 transition-all ${
            isVariantOutOfStock
              ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
              : 'border-primary text-primary hover:bg-primary hover:text-white'
          }`}
        >
          {isVariantOutOfStock ? 'Out of Stock' : 'Add to cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isVariantOutOfStock}
          className={`flex-1 rounded-xl font-semibold text-sm py-3.5 transition-all ${
            isVariantOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#f5a623] text-white hover:bg-[#e09510] shadow-sm'
          }`}
        >
          {isVariantOutOfStock
            ? 'Out of Stock'
            : `Buy Now · Rs. ${(Number(activeVariant?.salePrice || activeVariant?.price || product.price || 0) * quantity).toLocaleString('en-IN')}`
          }
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
