import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { removeFromCartAsync, updateCartItemAsync, applyCouponAsync, fetchCart } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [couponInput, setCouponInput] = useState(cart.couponCode || '');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (cart.couponCode) {
      setCouponInput(cart.couponCode);
    }
  }, [cart.couponCode]);

  const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (cart.appliedCoupon) {
    if (cart.appliedCoupon.type === 'percentage') {
      discountAmount = subtotal * (cart.appliedCoupon.value / 100);
      if (cart.appliedCoupon.maximumDiscount && discountAmount > cart.appliedCoupon.maximumDiscount) {
        discountAmount = cart.appliedCoupon.maximumDiscount;
      }
    } else if (cart.appliedCoupon.type === 'fixed') {
      discountAmount = cart.appliedCoupon.value;
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Your cart is empty</p>
          <Link
            to="/"
            className="mt-4 inline-block text-primary font-medium border-b border-primary pb-1 hover:text-gray-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      {item.selectedColor && item.selectedSize && <span className="mx-2">|</span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </p>
                  )}
                  <p className="text-primary font-medium mt-2">
                    Rs. {item.product.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                  <button
                    onClick={() =>
                      dispatch(
                        updateCartItemAsync({
                          id: item.product.id,
                          variantId: item.variantId,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors rounded-l-md"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateCartItemAsync({
                          id: item.product.id,
                          variantId: item.variantId,
                          quantity: item.quantity + 1,
                        })
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors rounded-r-md"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() =>
                    dispatch(
                      removeFromCartAsync({
                        id: item.product.id,
                        variantId: item.variantId,
                      })
                    )
                  }
                  className="ml-4 p-2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50 h-fit">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString('en-IN')}</span>
            </div>
            {cart.appliedCoupon && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>
                  Discount ({cart.appliedCoupon.code}
                  {cart.appliedCoupon.type === 'percentage' ? ` - ${cart.appliedCoupon.value}%` : ''})
                </span>
                <span>- Rs. {discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-4 mt-4 text-gray-900">
              <span>Total</span>
              <span>Rs. {total.toLocaleString('en-IN')}</span>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary uppercase text-sm"
                />
                <button
                  onClick={() => {
                    if (couponInput && !cart.isLoading) {
                      dispatch(applyCouponAsync({ code: couponInput, cartTotal: subtotal }));
                    }
                  }}
                  disabled={cart.isLoading}
                  className={`px-4 py-2 font-medium rounded-md transition-colors text-sm ${cart.isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {cart.isLoading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-primary text-white py-4 text-center mt-6 rounded-md font-medium hover:bg-gray-800 transition-colors tracking-wider uppercase text-sm"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
