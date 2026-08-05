import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCartAsync } from '../../features/cart/cartSlice';
import { toggleCart } from '../../features/ui/uiSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router';
import { X } from 'lucide-react';
import type { Product } from '../../types';

interface QuickAddModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ product, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Helper functions matching ProductDetail logic
  const getVariantColor = (v: any) => v.color || v.colorName || (v.attributes?.color) || '';
  const getVariantSize = (v: any) => v.size || (v.attributes?.size) || '';

  const prod = product as any;
  const allVariants = prod.variants || [];

  // Extract unique colors
  let uniqueColors: string[] = [];
  if (allVariants.length > 0) {
    uniqueColors = Array.from(new Set(allVariants.map((v: any) => getVariantColor(v)).filter(Boolean)));
  }

  // Get variants for the selected color
  let variantsForColor = allVariants;
  if (selectedColor && uniqueColors.length > 0) {
    variantsForColor = allVariants.filter((v: any) => getVariantColor(v) === selectedColor);
  }

  // Calculate available sizes based on selected color
  let availableSizes: { size: string, stock: number, variantId?: string }[] = [];
  if (variantsForColor.length > 0) {
    if (variantsForColor[0].sizes && Array.isArray(variantsForColor[0].sizes)) {
      availableSizes = variantsForColor[0].sizes.map((s: any) => ({
        size: s.size || s.name,
        stock: s.stock !== undefined ? s.stock : (s.quantity !== undefined ? s.quantity : 10),
        variantId: variantsForColor[0]._id || variantsForColor[0].id
      })).filter((s: any) => s.size);
    } else {
      availableSizes = variantsForColor.map((v: any) => ({
        size: getVariantSize(v),
        stock: v.stock !== undefined ? v.stock : (v.quantity !== undefined ? v.quantity : (v.status === 'active' ? 10 : 0)),
        variantId: v._id || v.id
      })).filter((s: any) => s.size);
    }
  }

  const activeVariant = variantsForColor.find((v: any) => getVariantSize(v) === selectedSize) || variantsForColor[0] || allVariants[0];

  useEffect(() => {
    if (isOpen && allVariants.length > 0) {
      const firstVariant = allVariants[0];
      const firstColor = getVariantColor(firstVariant);
      setSelectedColor(firstColor);
      const firstSize = getVariantSize(firstVariant);
      if (firstSize) {
        setSelectedSize(firstSize);
      } else if (firstVariant.sizes && firstVariant.sizes.length > 0) {
        setSelectedSize(firstVariant.sizes[0].size || '');
      }
      setQuantity(1);
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (availableSizes.length > 0) {
      const currentSizeStock = availableSizes.find(s => s.size === selectedSize)?.stock || 0;
      if (currentSizeStock === 0) {
        const firstAvailable = availableSizes.find(s => s.stock > 0);
        if (firstAvailable) setSelectedSize(firstAvailable.size);
      }
    }
  }, [selectedColor, availableSizes, selectedSize]);

  if (!isOpen) return null;

  const currentStock = activeVariant?.stock !== undefined ? activeVariant.stock : (activeVariant?.quantity !== undefined ? activeVariant.quantity : 10);
  const isVariantOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    let variantId = 'default';
    if (activeVariant) {
      variantId = activeVariant._id || activeVariant.id || 'default';
    }

    let fallbackImages = ['/placeholder.png'];
    if (prod.thumbnail) {
      fallbackImages = [prod.thumbnail, ...(prod.gallery || [])];
    } else if (prod.imageUrl) {
      fallbackImages = [prod.imageUrl];
    }
    const displayImages = activeVariant?.images?.length > 0 ? activeVariant.images : fallbackImages;

    dispatch(addToCartAsync({
      product: {
        ...product,
        id: product.id || prod._id,
        imageUrl: displayImages[0],
        price: Number(activeVariant?.salePrice || activeVariant?.price || product.price || 1499),
        mrp: Number(activeVariant?.price || prod.mrp)
      },
      quantity,
      selectedColor,
      selectedSize,
      variantId
    }));
    
    dispatch(toggleCart());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold uppercase">Quick Add</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          {/* Colors */}
          {uniqueColors.length > 0 && (
            <div className="mb-6">
              <span className="text-sm block mb-3 font-medium">Color: <span className="font-bold">{selectedColor}</span></span>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((colorStr, idx) => {
                  const variant = allVariants.find((v: any) => getVariantColor(v) === colorStr);
                  const imageUrl = variant?.images?.[0] || prod.thumbnail || prod.imageUrl || '/placeholder.png';
                  
                  return (
                    <button
                      key={colorStr || idx}
                      onClick={() => setSelectedColor(colorStr)}
                      className={`w-14 h-16 rounded-xl border-2 transition-all p-[2px] ${
                        selectedColor === colorStr ? 'border-black' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={colorStr}
                    >
                      <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100">
                        <img src={imageUrl} alt={colorStr} className="w-full h-full object-cover" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="mb-6">
            <span className="text-sm block mb-3 font-medium">Size: <span className="font-bold">{selectedSize}</span></span>
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
                      className={`relative min-w-[3rem] px-2 h-10 border text-sm transition-colors overflow-hidden ${selectedSize === size
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
                })
              ) : (
                <div className="text-sm text-gray-500 py-2 border rounded-md px-3">One Size</div>
              )}
            </div>
          </div>
          
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0 z-10">
          <button
            onClick={handleAddToCart}
            disabled={isVariantOutOfStock}
            className={`w-full py-3.5 px-4 font-bold tracking-widest uppercase transition-all duration-300 shadow-lg 
              ${isVariantOutOfStock 
                ? 'bg-gray-300 text-white cursor-not-allowed shadow-none' 
                : 'bg-primary text-white hover:bg-black hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
              }`}
          >
            {isVariantOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
