import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleWishlist, selectIsWishlisted } from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

// Expanded mock data to span multiple rows (4 columns wide)
const mockProducts = Array.from({ length: 16 }).map((_, i) => ({
  id: `prod-${i}`,
  name: i % 4 === 0 ? 'RAW BLACK WIDE' : i % 4 === 1 ? 'KEEP BLUE WIDE' : i % 4 === 2 ? 'TIPS GREEN WIDE' : 'TIPS BLUE WIDE',
  price: 1399 + (i % 3) * 100,
  originalPrice: 1600 + (i % 3) * 200,
  images: [
    `/images/model${(i % 3) + 1}.png`,
    `/images/model${((i + 1) % 3) + 1}.png`,
    `/images/model${((i + 2) % 3) + 1}.png`,
  ],
}));

const ProductCard: React.FC<{ product: typeof mockProducts[0] }> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isWishlisted = useAppSelector(state => selectIsWishlisted(state, product.id));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    dispatch(toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0],
      category: 'clothing',
      description: 'Premium quality product.'
    }));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link click
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Link to={`/products/${product.id}`} className="flex flex-col group cursor-pointer w-full">
      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
        <img 
          src={product.images[currentImageIndex]} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Hover Carousel Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={prevImage}
            className="w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-black shadow-sm"
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button 
            onClick={nextImage}
            className="w-7 h-7 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-black shadow-sm"
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {product.images.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-black shadow-sm transition-transform hover:scale-110 z-10"
        >
          <Heart size={16} strokeWidth={2} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      {/* Product Details */}
      <div className="mt-3 flex flex-col items-start text-left">
        <h3 className="text-[11px] sm:text-xs font-bold text-black uppercase tracking-wider mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="text-[#e35a39]">Rs. {product.price.toLocaleString('en-IN')}.00</span>
          <span className="text-gray-500 line-through">Rs. {product.originalPrice.toLocaleString('en-IN')}.00</span>
        </div>
      </div>
    </Link>
  );
};

const ProductGrid: React.FC = () => {
  return (
    <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-12 md:gap-x-4 md:gap-y-16">
        {mockProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
