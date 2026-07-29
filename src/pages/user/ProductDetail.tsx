import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, Link as LinkIcon, ShieldCheck, Truck, MessageCircle, Heart, Star, Share2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCartAsync } from '../../features/cart/cartSlice';
import { toggleCart } from '../../features/ui/uiSlice';
import { addToWishlistAsync, removeFromWishlistAsync, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import Accordion from '../../components/common/Accordion';

import { productsApi } from '../../services/productsApi';
import { userReviewsApi } from '../../services/user/reviews.Api';
import type { Product } from '../../types';

const SIZES = ['28', '30', '32', '34']; // Fallback sizes if variants have none
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
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

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
        
        try {
          const variantsResponse: any = await productsApi.getProductVariants(id);
          const actualVariants = variantsResponse.data?.variants || variantsResponse.data || variantsResponse;
          if (Array.isArray(actualVariants) && actualVariants.length > 0) {
            actualProduct.variants = actualVariants;
          }
        } catch (variantErr) {
          console.error('Failed to fetch variants', variantErr);
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

  // Derived state based on variants
  const uniqueColors = Array.from(new Set(product?.variants?.map((v: any) => v.attributes?.color || v.color).filter(Boolean))) as string[];
  
  const variantsForColor = product?.variants?.filter((v: any) => (v.attributes?.color || v.color) === selectedColor) || [];
  
  // Handle both flat structure (v.attributes.size) and nested structure (v.sizes)
  let availableSizes: { size: string, stock: number, variantId?: string }[] = [];
  if (variantsForColor.length > 0 && Array.isArray(variantsForColor[0].sizes)) {
    // Old nested structure
    availableSizes = variantsForColor[0].sizes;
  } else {
    // New flat structure
    availableSizes = variantsForColor.map((v: any) => ({
      size: v.attributes?.size || v.size || '',
      stock: v.stock !== undefined ? v.stock : (v.quantity !== undefined ? v.quantity : (v.status === 'active' ? 10 : 0)),
      variantId: v._id || v.id
    })).filter(s => s.size);
  }

  const activeVariant = variantsForColor.find((v: any) => (v.attributes?.size || v.size) === selectedSize) || variantsForColor[0] || product?.variants?.[0];
  
  let fallbackImages = ['/placeholder.png'];
  if (product?.thumbnail) {
    fallbackImages = [product.thumbnail, ...(product.gallery || [])];
  } else if (product?.imageUrl) {
    fallbackImages = [product.imageUrl];
  }

  const displayImages = activeVariant?.images && activeVariant.images.length > 0 
    ? activeVariant.images 
    : fallbackImages;

  let currentStock = 0;
  if (availableSizes.length > 0) {
    const sizeObj = availableSizes.find(s => s.size === selectedSize);
    currentStock = sizeObj ? sizeObj.stock : 0;
  } else if (activeVariant) {
    currentStock = activeVariant.stock !== undefined ? activeVariant.stock : (activeVariant.quantity !== undefined ? activeVariant.quantity : 0);
  } else if (product) {
    currentStock = (product as any).stock !== undefined ? (product as any).stock : ((product as any).quantity !== undefined ? (product as any).quantity : 10);
  }
  
  const isVariantOutOfStock = currentStock <= 0;

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
      // Support both flat (attributes.color) and legacy (color) structures
      const firstColor = firstVariant.attributes?.color || firstVariant.color || '';
      setSelectedColor(firstColor);
      // Support both flat (attributes.size / size) and nested (sizes[]) structures
      if (firstVariant.attributes?.size || firstVariant.size) {
        setSelectedSize(firstVariant.attributes?.size || firstVariant.size || '');
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
        mrp: Number(activeVariant?.price || product.mrp)
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
        mrp: Number(activeVariant?.price || product.mrp)
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
      <div className="text-xs text-gray-500 py-4 px-4 sm:px-8 border-b border-gray-100 flex flex-wrap gap-2 items-center">
        <Link to="/" className="hover:text-primary shrink-0">Home</Link>
        <span className="shrink-0">/</span>
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
        <span className="text-primary uppercase truncate">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row px-4 sm:px-8 py-8 lg:py-12 gap-8 lg:gap-16">

        {/* Left Column: Images */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <div 
            className="w-full aspect-[4/4] bg-gray-100 overflow-hidden relative cursor-crosshair"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={displayImages[selectedImage] || displayImages[0]}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out ${isZoomed ? 'scale-[2]' : 'scale-100'}`}
              style={isZoomed ? zoomStyle : { transformOrigin: 'center center' }}
            />
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
          {/* Wishlist + Share buttons */}
          <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                title="Share this product"
              >
                <Share2 size={20} strokeWidth={1.5} className="text-gray-500" />
              </button>
              {shareCopied && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap bg-gray-800 text-white px-2 py-0.5 rounded">
                  Copied!
                </span>
              )}
            </div>
            <button
              onClick={handleToggleWishlist}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              title="Toggle Wishlist"
            >
              <Heart size={20} strokeWidth={1.5} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
            </button>
          </div>

          <p className="text-sm text-gray-500 uppercase tracking-widest mb-1 pr-12">
            {(product as any).categoryId?.name || product.category || ''}
          </p>
          {(() => {
            const brandName = (product as any).brandId?.name || product.brand || (product as any).brand;
            return brandName ? (
              <p className="text-xs tracking-widest mb-2 pr-12">
                <span className="font-semibold text-primary uppercase">{brandName}</span>
              </p>
            ) : null;
          })()}
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wide mb-4 break-words pr-12">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl text-[#e35a39]">Rs. {Number(activeVariant?.salePrice || activeVariant?.price || product.price || 1499).toLocaleString('en-IN')}.00</span>
            {((activeVariant?.price && activeVariant?.salePrice) || (product.mrp && product.mrp > product.price) || (!product.price && !activeVariant?.price)) && (
              <span className="text-sm text-gray-500 line-through">Rs. {Number(activeVariant?.price || product.mrp || 1999).toLocaleString('en-IN')}.00</span>
            )}
          </div>


          <div className="text-sm text-gray-700 mb-6 flex flex-wrap gap-4">
            <span>Description: <span className="font-semibold">{product.description}</span></span>
          </div>

          {/* Color Selection */}
          {uniqueColors.length > 0 && (
            <div className="mb-6">
              <span className="text-sm block mb-3">Color: <span className="font-semibold">{selectedColor}</span></span>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((colorStr, idx) => (
                  <button
                    key={colorStr || idx}
                    onClick={() => setSelectedColor(colorStr)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === colorStr
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:scale-105'
                      }`}
                    style={{ backgroundColor: colorStr.toLowerCase() }}
                    title={colorStr}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Size: <span className="font-semibold">{selectedSize}</span></span>
              <button className="text-sm underline flex items-center gap-1">
                <span className="w-4 h-4 inline-block bg-primary text-white text-[10px] text-center leading-4">📏</span> Size Chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => {
                const sizeData = availableSizes.find(s => s.size === size);
                const isOutOfStock = sizeData ? sizeData.stock === 0 : true;

                return (
                  <button
                    key={size}
                    onClick={() => !isOutOfStock && setSelectedSize(size)}
                    disabled={isOutOfStock}
                    className={`relative w-12 h-10 border text-sm transition-colors overflow-hidden ${selectedSize === size
                        ? 'bg-primary text-white border-primary'
                        : isOutOfStock
                          ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-primary border-gray-300 hover:border-primary'
                      }`}
                  >
                    {size}
                    {isOutOfStock && (
                      <div className="absolute inset-0 w-full h-full pointer-events-none">
                        <div className="absolute top-1/2 left-[-10%] w-[120%] h-px bg-gray-300 transform -translate-y-1/2 -rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {isVariantOutOfStock && (
              <p className="text-red-500 text-xs mt-2 font-medium">Out of Stock</p>
            )}
            {!isVariantOutOfStock && currentStock < 10 && (
              <p className="text-[#e35a39] text-xs mt-2 font-medium">
                Only {currentStock} piece{currentStock === 1 ? '' : 's'} left!
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex border border-gray-300 w-32 shrink-0">
              <button
                className="w-10  flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-full text-center focus:outline-none"
              />
              <button
                className="w-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isVariantOutOfStock}
              className={`flex-1 rounded-xl font-medium text-base py-4 px-6 transition-colors ${
                isVariantOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-gray-800'
              }`}
            >
              {isVariantOutOfStock ? 'Out of Stock' : `Add to Cart - Rs. ${Number(activeVariant?.salePrice || activeVariant?.price || product.price || 0).toLocaleString('en-IN')}.00`}
            </button>
          </div>

          <button 
            onClick={handleBuyNow}
            disabled={isVariantOutOfStock}
            className={`w-full border rounded-xl py-4 font-medium mb-10 transition-colors ${
              isVariantOutOfStock ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-primary hover:bg-gray-50'
            }`}
          >
            {isVariantOutOfStock ? 'Out of Stock' : 'Buy it now'}
          </button>

          {/* Accordions */}
          <div className="border-t border-gray-200">
            <Accordion title="Description">
              <p>Premium relaxed fit denim designed for everyday comfort and style. Features specialized wash treatments and reinforced stitching.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>100% Cotton</li>
                <li>Machine wash cold</li>
                <li>Relaxed baggy fit</li>
                <li>Imported</li>
              </ul>
            </Accordion>
            <Accordion title="Shipping and Returns">
              <p>Free standard shipping on all orders over Rs. 2,999.00.</p>
              <p className="mt-2">Returns accepted within 14 days of delivery. Items must be unworn with original tags attached.</p>
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
      <div className="px-4 sm:px-8 py-16 border-t border-gray-100">
        <h2 className="text-2xl sm:text-3xl mb-8">Customer Reviews</h2>

        {isLoadingReviews ? (
          <div className="text-gray-500 animate-pulse">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet for this product.</div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            {reviews.map((review, idx) => (
              <div key={review._id || review.id || idx} className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={16} 
                      className={star <= (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                    />
                  ))}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{review.review || review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {review.images.map((img: string, i: number) => (
                      <img key={i} src={img} alt="Review" className="w-20 h-20 object-cover border border-gray-200 rounded" />
                    ))}
                  </div>
                )}
                {(() => {
                  const reviewerName = review.userId?.firstName 
                    ? `${review.userId.firstName} ${review.userId.lastName || ''}`.trim() 
                    : review.user?.name || review.user?.firstName || review.reviewerName || review.author || 'Anonymous';
                  return (
                    <p className="text-xs text-gray-400 mt-2">
                      By {reviewerName} on {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
                    </p>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* You May Also Like Section */}
      <div className="px-4 sm:px-8 py-16 border-t border-gray-100">
        <h2 className="text-2xl sm:text-3xl mb-8">You may also like</h2>
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
      <div className="px-4 sm:px-8 py-16 bg-gray-50 mt-12">
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
    </div>
  );
};

export default ProductDetail;
