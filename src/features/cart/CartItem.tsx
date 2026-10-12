import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { removeFromCartAsync, updateCartItemAsync } from './cartSlice';
import { toggleCart } from '../ui/uiSlice';
import { Link } from 'react-router';
import type { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { product, quantity } = item;

  const handleIncrement = () => {
    dispatch(updateCartItemAsync({ id: product.id, variantId: item.variantId, quantity: quantity + 1 }));
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      dispatch(updateCartItemAsync({ id: product.id, variantId: item.variantId, quantity: quantity - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCartAsync({ id: item.id || product.id, variantId: item.variantId }));
  };

  return (
    <div className="flex py-6 border-b border-gray-100 last:border-0">
      <Link 
        to={`/products/${product.id}`}
        onClick={() => dispatch(toggleCart())}
        className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </Link>

      <div className="ml-4 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between text-sm sm:text-base font-medium text-gray-900 gap-2">
            <Link 
              to={`/products/${product.id}`}
              onClick={() => dispatch(toggleCart())}
              className="line-clamp-2 flex-1 hover:underline cursor-pointer"
            >
              <h3>{product.name}</h3>
            </Link>
            <div className="text-right shrink-0">
              <p className="font-bold">Rs. {Math.round(product.price).toLocaleString('en-IN')}</p>

            </div>
          </div>
          {(item.selectedColor || item.selectedSize) && (
            <p className="mt-1 text-xs text-gray-500">
              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
              {item.selectedColor && item.selectedSize && <span className="mx-2">|</span>}
              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
            </p>
          )}
        </div>
        
        <div className="flex flex-1 items-end justify-between text-sm mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={handleDecrement}
              className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors rounded-l-md disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={handleIncrement}
              className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors rounded-r-md"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex ml-2">
            <button
              type="button"
              onClick={handleRemove}
              className="font-medium text-red-500 hover:text-red-700 flex items-center transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1 shrink-0" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
