import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { userOrdersApi } from '../../services/user/orders.Api';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Optional: Pass statusFilter to getOrderHistory if API supports it, otherwise filter locally
      const statusParam = statusFilter === 'All' ? undefined : statusFilter;
      const response = await userOrdersApi.getOrderHistory(1, 100, statusParam);
      
      // Assume response.data or response is array, or response.orders, etc.
      const fetchedOrders = Array.isArray(response) ? response : (response.data || response.orders || []);
      setOrders(fetchedOrders);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders; // We filter via API call now, or fallback locally if needed.
  const orderStatuses = ['All', 'Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

  const handleBuyAgain = (_orderId: string) => {
    // Simulating adding order items back to cart and navigating to checkout
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors self-start sm:self-auto"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Profile
          </button>
          <h1 className="text-xl font-bold tracking-widest uppercase">Order History</h1>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black text-sm"
          >
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 bg-white border border-gray-200">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white border border-gray-200">
              No orders found matching this status.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id || order._id} className="bg-white border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div className="flex flex-wrap gap-4 md:gap-8 text-sm">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Order Placed</span>
                      <span className="block mt-1 font-medium text-gray-800">{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                      <span className="block mt-1 font-medium text-gray-800">Rs. {(order.total || order.totalAmount || 0).toLocaleString('en-IN')}.00</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                      <span className="block mt-1 font-medium text-gray-800">{order.id || order._id}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border 
                      ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                        ['Processing', 'Confirmed', 'Packed'].includes(order.status) ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        ['Shipped', 'Out for Delivery'].includes(order.status) ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-800 border-yellow-200'}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(order.items || []).map((item: any) => (
                    <div key={item.id || item._id} className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-gray-100 flex-shrink-0 border border-gray-100">
                        <img src={item.image || item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex justify-between">
                        <div>
                          <h4 className="text-sm font-bold uppercase text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.qty || item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Rs. {(item.price || 0).toLocaleString('en-IN')}.00</p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-xs text-gray-500 line-through">Rs. {(item.originalPrice || 0).toLocaleString('en-IN')}.00</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Original MRP Total</span>
                    <span>Rs. {(order.mrpTotal || order.total || 0).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discounts Applied</span>
                    <span>- Rs. {(order.discount || 0).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-50">
                    <span>Final Amount Paid</span>
                    <span>Rs. {order.total.toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleBuyAgain(order.id)}
                    className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Buy Again
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
