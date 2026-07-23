import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { userOrdersApi } from '../../services/user/orders.Api';
import { productsApi } from '../../services/productsApi';
import toast from 'react-hot-toast';
import { AdminPagination } from '../../components/admin/AdminPagination';

const OrderItemImage: React.FC<{ item: any }> = ({ item }) => {
  const initialImage = item.image || item.imageUrl || item.product?.image || item.product?.images?.[0] || null;
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage);

  useEffect(() => {
    if (!imageUrl && item.productId) {
      productsApi.getProductById(item.productId)
        .then((res: any) => {
          const p = res.data?.product || res.data || res;
          if (p.thumbnail) setImageUrl(p.thumbnail);
          else if (p.imageUrl) setImageUrl(p.imageUrl);
          else if (p.images && p.images.length > 0) setImageUrl(p.images[0]);
        })
        .catch(err => console.error("Failed to fetch image for product", item.productId, err));
    }
  }, [item.productId, imageUrl]);

  if (imageUrl) {
    return <img src={imageUrl} alt={item.productName || item.name || 'Product'} className="w-full h-full object-cover" />;
  }
  return <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>;
};

const Orders: React.FC = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductItem, setSelectedProductItem] = useState<any>(null);
  const [fullProductDetails, setFullProductDetails] = useState<any>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);

  const openProductDetails = async (item: any) => {
    setSelectedProductItem(item);
    setFullProductDetails(null);
    const productId = item.productId || item.product?._id || item.product?.id || (typeof item.product === 'string' ? item.product : null) || item._id;
    if (productId && typeof productId === 'string') {
      setIsFetchingProduct(true);
      try {
        const response: any = await productsApi.getProductById(productId);
        const p = response.data?.product || response.data || response;
        setFullProductDetails(p);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setIsFetchingProduct(false);
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Optional: Pass statusFilter to getOrderHistory if API supports it, otherwise filter locally
      const statusParam = statusFilter === 'All' ? undefined : statusFilter;
      const response = await userOrdersApi.getOrderHistory(currentPage, itemsPerPage, statusParam);

      // Assume response.data or response is array, or response.orders, etc.
      let fetchedOrders = [];
      let total = 0;

      if (response.data && Array.isArray(response.data.orders)) {
        fetchedOrders = response.data.orders;
        total = response.data.total || 0;
      } else if (response.data && Array.isArray(response.data)) {
        fetchedOrders = response.data;
        total = response.total || fetchedOrders.length;
      } else if (Array.isArray(response.orders)) {
        fetchedOrders = response.orders;
        total = response.total || 0;
      } else if (Array.isArray(response)) {
        fetchedOrders = response;
        total = fetchedOrders.length;
      }

      setOrders(fetchedOrders);
      setTotalOrders(total);
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
            className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors self-start sm:self-auto"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Profile
          </button>
          <h1 className="text-xl font-bold tracking-widest uppercase">Order History</h1>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-primary text-sm"
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
                      <span className="block mt-1 font-medium text-gray-800">Rs. {(order.grandTotal || order.total || order.totalAmount || 0).toLocaleString('en-IN')}.00</span>
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
                  {(order.orderedItems || order.items || []).map((item: any, idx: number) => (
                    <div 
                      key={item.id || item._id || idx} 
                      onClick={() => openProductDetails(item)}
                      className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded transition-colors"
                    >
                      <div className="w-16 h-20 bg-gray-100 flex-shrink-0 border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                        <OrderItemImage item={item} />
                      </div>
                      <div className="flex-1 flex justify-between">
                        <div>
                          <h4 className="text-sm font-bold uppercase text-gray-900">{item.productName || item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity || item.qty}</p>
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
                    <span>Rs. {(order.subtotal || order.mrpTotal || order.total || 0).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discounts Applied</span>
                    <span>- Rs. {(order.discount || 0).toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-50">
                    <span>Final Amount Paid</span>
                    <span>Rs. {(order.grandTotal || order.total || 0).toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleBuyAgain(order.id)}
                    className="px-6 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Buy Again
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalOrders > 0 && (
          <div className="mt-8">
            <AdminPagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalOrders / itemsPerPage) || 1}
              onPageChange={setCurrentPage}
              totalItems={totalOrders}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProductItem && (() => {
        const displayProduct = fullProductDetails || selectedProductItem.product || selectedProductItem;
        const name = displayProduct.name || displayProduct.productName || selectedProductItem.productName || selectedProductItem.name;
        
        return (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setSelectedProductItem(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Product Details</h3>
              <div className="flex gap-6">
                <div className="w-24 h-32 bg-gray-100 flex-shrink-0 border border-gray-200">
                  <OrderItemImage item={selectedProductItem} />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-md font-bold text-gray-900">{name}</h4>
                  <p className="text-sm text-gray-600">Qty: {selectedProductItem.quantity || selectedProductItem.qty || 1}</p>
                  <p className="text-sm text-gray-900 font-medium">Rs. {(selectedProductItem.price || 0).toLocaleString('en-IN')}</p>
                  {selectedProductItem.originalPrice && selectedProductItem.originalPrice > selectedProductItem.price && (
                    <p className="text-xs text-gray-500 line-through">Rs. {(selectedProductItem.originalPrice || 0).toLocaleString('en-IN')}</p>
                  )}
                  {selectedProductItem.color && <p className="text-sm text-gray-600">Ordered Color: {selectedProductItem.color}</p>}
                  {selectedProductItem.size && <p className="text-sm text-gray-600">Ordered Size: {selectedProductItem.size}</p>}
                  
                  {isFetchingProduct && <p className="text-xs text-primary mt-2 animate-pulse">Loading live details...</p>}
                  
                  {!isFetchingProduct && fullProductDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Live Product Info</p>
                      <p className="text-xs text-gray-600 line-clamp-2" title={fullProductDetails.description}>{fullProductDetails.description}</p>
                      <p className="text-xs text-gray-600 mt-1">Category: {fullProductDetails.category?.name || fullProductDetails.category}</p>
                      <p className="text-xs text-gray-600">In Stock: {fullProductDetails.stock || 'Yes'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedProductItem(null)}
                className="px-6 py-2 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )})()}
    </div>
  );
};

export default Orders;
