import React, { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleCart } from '../ui/uiSlice';
import { selectCartTotal } from './cartSlice';
import { selectIsAuthenticated } from '../auth/authSlice';
import CartItem from './CartItem';
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isCartOpen = useAppSelector((state) => state.ui.isCartOpen);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector(selectCartTotal);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity"
        onClick={() => dispatch(toggleCart())}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">

        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shopping Cart ({cartItems.length})
          </h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Close cart</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" strokeWidth={1} />
              <p className="text-lg font-medium">Your cart is empty</p>
              <button 
                onClick={() => {
                  dispatch(toggleCart());
                  navigate('/');
                }}
                className="mt-6 px-6 py-2 bg-black text-white font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                if (!item || !item.product) return null;
                const uniqueKey = `${item.product.id || 'no-id'}-${item.variantId || 'no-variant'}-${index}`;
                return <CartItem key={uniqueKey} item={item} />;
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 px-6 pt-6 pb-8 bg-gray-50 flex flex-col gap-4 shrink-0">
            
            {/* Coupon Code Input */}
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Coupon Code" 
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black uppercase text-sm"
              />
              <button className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors text-sm">
                Apply
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <p>Original Price (MRP)</p>
                <p>Rs. {cartItems.reduce((total, item) => {
                  if (!item || !item.product) return total;
                  return total + ((item.product.mrp || item.product.price || 0) * (item.quantity || 0));
                }, 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <p>Total Savings</p>
                <p>- Rs. {cartItems.reduce((total, item) => {
                  if (!item || !item.product) return total;
                  const mrp = item.product.mrp || item.product.price || 0;
                  const price = item.product.price || 0;
                  return total + ((mrp - price) * (item.quantity || 0));
                }, 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <p>Final Payable Amount</p>
                <p>Rs. {cartTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              Shipping and taxes calculated at checkout.
            </p>
            
            <button
              onClick={() => {
                dispatch(toggleCart());
                if (isAuthenticated) {
                  navigate('/checkout'); // Placeholder route
                } else {
                  navigate('/login');
                }
              }}
              className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors uppercase tracking-widest"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
