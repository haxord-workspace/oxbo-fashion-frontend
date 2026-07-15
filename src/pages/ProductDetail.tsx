import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Link as LinkIcon, ShieldCheck, Truck, MessageCircle, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addItem } from '../features/cart/cartSlice';
import { toggleCart } from '../features/ui/uiSlice';
import { toggleWishlist, selectIsWishlisted } from '../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import Accordion from '../components/common/Accordion';

// Duplicate mock data for now, in a real app this would be fetched from an API/Redux
const mockProducts = Array.from({ length: 16 }).map((_, i) => ({
  id: `prod-${i}`,
  name: i % 4 === 0 ? 'RAW BLACK WIDE' : i % 4 === 1 ? 'KEEP BLUE WIDE' : i % 4 === 2 ? 'TIPS GREEN WIDE' : 'TIPS BLUE WIDE',
  price: 1399 + (i % 3) * 100,
  originalPrice: 1600 + (i % 3) * 200,
  images: [
    `/images/model${(i % 3) + 1}.png`,
    `/images/model${((i + 1) % 3) + 1}.png`,
    `/images/model${((i + 2) % 3) + 1}.png`,
    `/images/model${(i % 3) + 1}.png`,
  ],
  brand: 'BLURGVILLAGE',
  viewers: 46 + i,
  details: {
    rise: 12,
    thighs: 22,
    length: 41,
    legOpening: 20
  },
  variants: [
    {
      color: 'Black',
      images: [
        `/images/model${(i % 3) + 1}.png`,
        `/images/model${((i + 1) % 3) + 1}.png`
      ],
      sizes: [
        { size: '28', stock: 5 },
        { size: '30', stock: 0 },
        { size: '32', stock: 12 },
        { size: '34', stock: 3 }
      ]
    },
    {
      color: 'Blue',
      images: [
        `/images/model${((i + 2) % 3) + 1}.png`,
        `/images/model${(i % 3) + 1}.png`
      ],
      sizes: [
        { size: '28', stock: 0 },
        { size: '30', stock: 2 },
        { size: '32', stock: 0 },
        { size: '34', stock: 8 }
      ]
    }
  ]
}));

const SIZES = ['28', '30', '32', '34'];

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const product = mockProducts.find(p => p.id === id) || mockProducts[0];
  const relatedProducts = mockProducts.filter(p => p.id !== product.id).slice(0, 4);
  const isWishlisted = useAppSelector(state => selectIsWishlisted(state, product.id));
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [selectedColor, setSelectedColor] = useState<string>(product.variants?.[0]?.color || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('28');
  const [quantity, setQuantity] = useState(1);

  // Derived state based on variants
  const activeVariant = product.variants?.find(v => v.color === selectedColor) || product.variants?.[0];
  const displayImages = activeVariant?.images || product.images;
  const availableSizes = activeVariant?.sizes || [];
  
  // Update size if current size is out of stock in new color
  useEffect(() => {
    if (activeVariant) {
      const currentSizeStock = activeVariant.sizes.find(s => s.size === selectedSize)?.stock || 0;
      if (currentSizeStock === 0) {
        const firstAvailable = activeVariant.sizes.find(s => s.stock > 0);
        if (firstAvailable) setSelectedSize(firstAvailable.size);
      }
    }
  }, [selectedColor]);

  // Reset state when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedColor(product.variants?.[0]?.color || '');
  }, [id, product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(addItem({
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        mrp: product.originalPrice,
        imageUrl: displayImages[0],
        category: 'clothing',
        description: 'Premium quality product.'
      },
      quantity,
      selectedColor,
      selectedSize
    }));
    dispatch(toggleCart());
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: displayImages[0],
      category: 'clothing',
      description: 'Premium quality product.'
    }));
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto bg-white">
      {/* Breadcrumb / Top Bar */}
      <div className="text-xs text-gray-500 py-4 px-4 sm:px-8 border-b border-gray-100 flex flex-wrap gap-2">
        <Link to="/" className="hover:text-black shrink-0">Home</Link>
        <span className="shrink-0">/</span>
        <span className="text-black uppercase truncate">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row px-4 sm:px-8 py-8 lg:py-12 gap-8 lg:gap-16">
        
        {/* Left Column: Images */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          <div className="w-full aspect-[4/4] bg-gray-100 overflow-hidden relative">
            <img 
              src={displayImages[selectedImage] || displayImages[0]} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {displayImages.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-[3/4] bg-gray-100 overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-black' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="w-full lg:w-2/5 flex flex-col relative">
          <button 
            onClick={handleToggleWishlist}
            className="absolute top-0 right-0 p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors z-10"
            title="Toggle Wishlist"
          >
            <Heart size={20} strokeWidth={1.5} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
          </button>

          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2 pr-12">{product.brand}</p>
          <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wide mb-4 break-words pr-12">{product.name}</h1>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl text-[#e35a39]">Rs. {product.price.toLocaleString('en-IN')}.00</span>
            <span className="text-sm text-gray-500 line-through">Rs. {product.originalPrice.toLocaleString('en-IN')}.00</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#e35a39] mb-8 font-medium">
            <span className="animate-pulse">⚡</span>
            <span>{product.viewers} shoppers viewing this right now</span>
          </div>

          <div className="text-sm text-gray-700 mb-6 flex flex-wrap gap-4">
            <span>Rise: <span className="font-semibold">{product.details.rise}</span></span>
            <span>Thighs: <span className="font-semibold">{product.details.thighs}</span></span>
            <span>Length: <span className="font-semibold">{product.details.length}</span></span>
            <span>Leg Opening: <span className="font-semibold">{product.details.legOpening}</span></span>
          </div>

          {/* Color Selection */}
          {product.variants && (
            <div className="mb-6">
              <span className="text-sm block mb-3">Color: <span className="font-semibold">{selectedColor}</span></span>
              <div className="flex flex-wrap gap-3">
                {product.variants.map(variant => (
                  <button
                    key={variant.color}
                    onClick={() => setSelectedColor(variant.color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === variant.color 
                        ? 'border-black scale-110' 
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: variant.color.toLowerCase() === 'black' ? '#000' : variant.color.toLowerCase() === 'blue' ? '#3b82f6' : '#ccc' }}
                    title={variant.color}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm">Size: <span className="font-semibold">{selectedSize}</span></span>
              <button className="text-sm underline flex items-center gap-1">
                <span className="w-4 h-4 inline-block bg-black text-white text-[10px] text-center leading-4">📏</span> Size Chart
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
                    className={`relative w-12 h-10 border text-sm transition-colors overflow-hidden ${
                      selectedSize === size 
                        ? 'bg-black text-white border-black' 
                        : isOutOfStock
                          ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-black border-gray-300 hover:border-black'
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
            {availableSizes.find(s => s.size === selectedSize)?.stock === 0 && (
              <p className="text-red-500 text-xs mt-2 font-medium">Out of stock in this size/color combination.</p>
            )}
            {(() => {
              const stock = availableSizes.find(s => s.size === selectedSize)?.stock || 0;
              return stock > 0 && stock <= 5 ? (
                <p className="text-[#e35a39] text-xs mt-2 font-medium">Only {stock} left in stock - order soon.</p>
              ) : null;
            })()}
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
  className="flex-1 rounded-xl bg-black text-white font-medium text-base py-4 px-6 hover:bg-gray-800 transition-colors"
>
  Add to Cart - Rs. {product.price.toLocaleString('en-IN')}.00
</button>
          </div>

          <button className="w-full border border-black rounded-xl py-4 font-medium mb-10 hover:bg-gray-50 transition-colors">
            Buy it now
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
                <button key={icon} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black hover:text-black transition-colors">
                  {icon === 'W' ? <MessageCircle size={14} /> : icon === 'M' ? <LinkIcon size={14} /> : icon}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* You May Also Like Section */}
      <div className="px-4 sm:px-8 py-16 border-t border-gray-100">
        <h2 className="text-2xl sm:text-3xl mb-8">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map(rp => (
            <Link key={rp.id} to={`/products/${rp.id}`} className="flex flex-col group">
              <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                <img 
                  src={rp.images[0]} 
                  alt={rp.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-1">{rp.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#e35a39]">Rs. {rp.price.toLocaleString('en-IN')}.00</span>
                <span className="text-gray-500 line-through">Rs. {rp.originalPrice.toLocaleString('en-IN')}.00</span>
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
