import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { removeItem, updateQuantity } from './cartSlice';
import type { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { product, quantity } = item;

  const handleIncrement = () => {
    dispatch(updateQuantity({ id: product.id, quantity: quantity + 1 }));
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      dispatch(updateQuantity({ id: product.id, quantity: quantity - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeItem(product.id));
  };

  return (
    <div className="flex py-6 border-b border-gray-100 last:border-0">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3 className="line-clamp-2 pr-4">{product.name}</h3>
            <p className="ml-4">${product.price.toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-gray-500 capitalize">{product.category}</p>
        </div>
        
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              onClick={handleDecrement}
              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors rounded-l-md disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={handleIncrement}
              className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors rounded-r-md"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={handleRemove}
              className="font-medium text-red-500 hover:text-red-700 flex items-center transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
