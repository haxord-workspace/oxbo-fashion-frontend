import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');

  // Mock order items for the summary
  const orderItems = [
    {
      id: '1',
      name: 'RAW BLACK WIDE',
      price: 1399,
      image: '/images/model1.png',
      quantity: 1,
    },
    {
      id: '2',
      name: 'TIPS GREEN WIDE',
      price: 1599,
      image: '/images/model2.png',
      quantity: 1,
    }
  ];

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 99;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Normally handle order creation API call here
    toast.success('Order placed successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Cart
          </button>
          <h1 className="text-xl font-bold tracking-widest uppercase">Checkout</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left Column - Shipping & Payment */}
          <div className="flex-1">
            <div className="mb-12">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-2">First Name</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Last Name</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Address</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="123 Luxury Ave" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-2">City</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-2">PIN Code</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="400001" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-2">Phone</label>
                  <input type="tel" required className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">Payment Method</h2>
              <div className="space-y-4">
                <label className={`block border ${paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-colors`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium uppercase tracking-wide">Credit / Debit Card</span>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="mt-6 space-y-4 animate-fade-in">
                      <input type="text" placeholder="Card Number" className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />
                        <input type="text" placeholder="CVV" className="w-full border border-gray-300 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors" />
                      </div>
                    </div>
                  )}
                </label>

                <label className={`block border ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-colors`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <span className="ml-3 text-sm font-medium uppercase tracking-wide">Cash on Delivery (COD)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-gray-50 p-6 md:p-8 sticky top-32">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6">Order Summary</h2>
              
              <div className="space-y-6 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-200 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase">{item.name}</h3>
                        <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">Rs. {item.price.toLocaleString('en-IN')}.00</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Rs. {shipping.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4 text-base font-bold">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-4 mt-8 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Place Order
              </button>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
