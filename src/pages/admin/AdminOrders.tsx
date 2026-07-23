import { useState, useEffect } from 'react';
import { Search, Filter, Truck, FileText, Store, Eye } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import AdminModal from '../../components/common/AdminModal';
import { LoadingButton } from '../../components/common/LoadingButton';
import { adminOrderApi } from '../../services/admin/adminOrder.Api';
import { adminStoreApi } from '../../services/admin/adminStore.Api';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../app/hooks';
import { selectIsAdmin } from '../../features/auth/authSlice';

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export const AdminOrders = () => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const [statusFilter, setStatusFilter] = useState('All');
  const [storeFilter, setStoreFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Tracking Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [orderToTrack, setOrderToTrack] = useState<any>(null);
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', courierName: '', estimatedDeliveryDate: '' });
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);
  const [trackingErrors, setTrackingErrors] = useState<Record<string, string>>({});

  // Assign Store Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<any>(null);
  const [availableStores, setAvailableStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [isAssigningStore, setIsAssigningStore] = useState(false);
  const [assignStoreError, setAssignStoreError] = useState('');

  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // The user specified limit=50 in the API request

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await adminOrderApi.getOrders({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        store: storeFilter !== '' ? storeFilter : undefined,
        search: searchQuery || undefined
      });
      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminOrderApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const openTrackingModal = (order: any) => {
    setOrderToTrack(order);
    setTrackingForm({
      trackingNumber: order.tracking?.trackingNumber || order.trackingNumber || '',
      courierName: order.tracking?.courierName || order.courierName || order.courier || '',
      estimatedDeliveryDate: order.tracking?.estimatedDeliveryDate 
        ? new Date(order.tracking.estimatedDeliveryDate).toISOString().slice(0, 16) 
        : order.estimatedDeliveryDate 
          ? new Date(order.estimatedDeliveryDate).toISOString().slice(0, 16) 
          : ''
    });
    setTrackingErrors({});
    setIsTrackingModalOpen(true);
  };

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToTrack) return;
    setIsSubmittingTracking(true);
    setTrackingErrors({});
    try {
      const payload = {
        trackingNumber: trackingForm.trackingNumber,
        courierName: trackingForm.courierName,
        estimatedDeliveryDate: trackingForm.estimatedDeliveryDate ? new Date(trackingForm.estimatedDeliveryDate).toISOString() : undefined
      };
      await adminOrderApi.updateOrderTracking(orderToTrack._id || orderToTrack.id, payload);
      setIsTrackingModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to update tracking', error);
      if (error.response?.data?.errors) {
        const errorsObj: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          const field = err.field?.replace('body.', '') || 'general';
          errorsObj[field] = err.message;
        });
        setTrackingErrors(errorsObj);
      } else {
        setTrackingErrors({ general: error.response?.data?.message || 'An error occurred while saving.' });
      }
    } finally {
      setIsSubmittingTracking(false);
    }
  };

  const openDetailsModal = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setIsDownloadingInvoice(true);
    try {
      const blob = await adminOrderApi.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice', error);
      alert('Failed to download invoice. It might not be available yet.');
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const openStoreModal = async (order: any) => {
    setOrderToAssign(order);
    setSelectedStoreId(order.store?._id || order.storeId || order.store || '');
    setAssignStoreError('');
    setIsStoreModalOpen(true);
    if (availableStores.length === 0) {
      try {
        const { stores } = await adminStoreApi.getStores({ limit: 100 });
        setAvailableStores(stores);
      } catch (error) {
        console.error('Failed to fetch stores', error);
      }
    }
  };

  const handleAssignStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToAssign || !selectedStoreId) return;
    setIsAssigningStore(true);
    setAssignStoreError('');
    try {
      const response = await adminOrderApi.assignStore(orderToAssign._id || orderToAssign.id, selectedStoreId);
      
      if (response && response.success === false) {
        setAssignStoreError(response.message || 'Failed to assign store');
        return;
      }
      
      setIsStoreModalOpen(false);
      toast.success(response.message || 'Store assigned to order successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to assign store', error);
      setAssignStoreError(error.response?.data?.message || 'Failed to assign store');
    } finally {
      setIsAssigningStore(false);
    }
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { stores } = await adminStoreApi.getStores({ limit: 100 });
        setAvailableStores(stores);
      } catch (error) {
        console.error('Failed to fetch stores', error);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, statusFilter, storeFilter, searchQuery]);

  const totalPages = Math.ceil(totalOrders / itemsPerPage) || 1;

  return (
    <PageWrapper title="Orders">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          {isAdmin && (
            <select 
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">All Stores</option>
              {availableStores.map(store => (
                <option key={store._id || store.id} value={store._id || store.id}>{store.name}</option>
              ))}
            </select>
          )}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer"
          >
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="pb-3 font-medium px-4">Customer</th>
              <th className="pb-3 font-medium px-4">Date</th>
              <th className="pb-3 font-medium px-4">Store</th>
              <th className="pb-3 font-medium px-4">Products</th>
              <th className="pb-3 font-medium px-4">Total</th>
              <th className="pb-3 font-medium px-4">Status</th>
              <th className="pb-3 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">No orders found matching your filters.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id || order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : order.customer?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.userId?.email || order.customer?.email || 'N/A'}</p>
                    {(order.shippingAddress?.city || order.shippingAddress?.state || order.customer?.address) && (
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        📍 {order.shippingAddress?.city || order.customer?.address || 'Unknown'}
                        {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    {order.store?.name || order.storeName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                        <Store size={12} />
                        {order.store?.name || order.storeName}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {(order.orderedItems || order.items || order.products || []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {item.image || item.imageUrl || item.product?.image || item.product?.images?.[0] ? (
                            <img src={item.image || item.imageUrl || item.product?.image || item.product?.images?.[0]} alt="product" className="w-6 h-6 object-cover rounded border border-gray-100" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                          )}
                          <span className="truncate max-w-[120px] font-medium text-gray-700" title={item.productName || item.name || item.product?.name || 'Item'}>
                            {item.productName || item.name || item.product?.name || 'Item'}
                          </span>
                          <span className="text-gray-400">x{item.quantity || item.qty || 1}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">Rs. {(order.grandTotal || order.totalAmount || order.total || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4">
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-1 focus:ring-primary outline-none
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        ['Processing', 'Confirmed', 'Packed'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                        ['Shipped', 'Out for Delivery'].includes(order.status) ? 'bg-purple-100 text-purple-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {ORDER_STATUSES.filter(s => s !== 'All').map(status => (
                        <option key={status} value={status} className="bg-white text-primary">{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      {isAdmin && (
                        <button onClick={() => openStoreModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 rounded-md transition-colors">
                          <Store size={14} />
                          {order.store || order.storeId ? 'Reassign' : 'Assign'}
                        </button>
                      )}
                      <button onClick={() => openDetailsModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 rounded-md transition-colors">
                        <Eye size={14} />
                        View
                      </button>
                      <button onClick={() => openTrackingModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-md transition-colors">
                        <Truck size={14} />
                        Track
                      </button>
                   
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalOrders > 0 && (
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalOrders}
          itemsPerPage={itemsPerPage}
        />
      )}

      <AdminModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        title="Update Tracking Info"
      >
        <form className="space-y-4" onSubmit={handleTrackingSubmit}>
          {trackingErrors.general && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {trackingErrors.general}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
            <input 
              type="text" 
              value={trackingForm.courierName} 
              onChange={e => {
                setTrackingForm({...trackingForm, courierName: e.target.value});
                if (trackingErrors.courierName) setTrackingErrors({...trackingErrors, courierName: ''});
              }} 
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${trackingErrors.courierName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary'}`} 
              placeholder="e.g., FedEx, BlueDart" 
            />
            {trackingErrors.courierName && <p className="text-red-500 text-xs mt-1">{trackingErrors.courierName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
            <input 
              type="text" 
              value={trackingForm.trackingNumber} 
              onChange={e => {
                setTrackingForm({...trackingForm, trackingNumber: e.target.value});
                if (trackingErrors.trackingNumber) setTrackingErrors({...trackingErrors, trackingNumber: ''});
              }} 
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${trackingErrors.trackingNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary'}`} 
              placeholder="Enter tracking number" 
            />
            {trackingErrors.trackingNumber && <p className="text-red-500 text-xs mt-1">{trackingErrors.trackingNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date</label>
            <input 
              type="datetime-local" 
              value={trackingForm.estimatedDeliveryDate} 
              onChange={e => {
                setTrackingForm({...trackingForm, estimatedDeliveryDate: e.target.value});
                if (trackingErrors.estimatedDeliveryDate) setTrackingErrors({...trackingErrors, estimatedDeliveryDate: ''});
              }} 
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${trackingErrors.estimatedDeliveryDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary'}`} 
            />
            {trackingErrors.estimatedDeliveryDate && <p className="text-red-500 text-xs mt-1">{trackingErrors.estimatedDeliveryDate}</p>}
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => setIsTrackingModalOpen(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <LoadingButton 
              type="submit" 
              isLoading={isSubmittingTracking} 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Update Tracking
            </LoadingButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        title={orderToAssign?.store || orderToAssign?.storeId ? "Reassign Store" : "Assign Store"}
      >
        <form className="space-y-4" onSubmit={handleAssignStoreSubmit}>
          {assignStoreError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {assignStoreError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Store</label>
            <select 
              value={selectedStoreId} 
              onChange={e => setSelectedStoreId(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="" disabled>Select a store</option>
              {availableStores.map(store => (
                <option key={store._id || store.id} value={store._id || store.id}>
                  {store.name} - {store.city}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => setIsStoreModalOpen(false)} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <LoadingButton 
              type="submit" 
              isLoading={isAssigningStore} 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              {orderToAssign?.store || orderToAssign?.storeId ? 'Confirm Reassign' : 'Assign Store'}
            </LoadingButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Order Number</p>
                <p className="text-gray-900 font-bold">{selectedOrder.orderNumber || selectedOrder._id || selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Date</p>
                <p className="text-gray-900">{new Date(selectedOrder.placedDate || selectedOrder.createdAt || selectedOrder.date).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Customer</p>
                <p className="text-gray-900">{selectedOrder.userId ? `${selectedOrder.userId.firstName} ${selectedOrder.userId.lastName}` : selectedOrder.customer?.name || 'Guest'}</p>
                <p className="text-gray-500 text-xs">{selectedOrder.userId?.email || selectedOrder.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Status & Payment</p>
                <p className="text-gray-900 font-medium">{selectedOrder.status} / {selectedOrder.paymentStatus || 'Pending'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 font-medium">Shipping Address</p>
                {selectedOrder.shippingAddress ? (
                  <div className="text-gray-900">
                    <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.addressLine1} {selectedOrder.shippingAddress.addressLine2}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    <p className="text-gray-500 mt-1">📞 {selectedOrder.shippingAddress.phone}</p>
                  </div>
                ) : selectedOrder.customer?.address ? (
                  <p className="text-gray-900 capitalize">{selectedOrder.customer.address}</p>
                ) : (
                  <p className="text-gray-400 italic">Not available</p>
                )}
              </div>
              
              {selectedOrder.notes && (
                <div className="col-span-2 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                  <p className="text-yellow-800 font-medium text-xs mb-1">Customer Notes</p>
                  <p className="text-yellow-700 text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-500 font-medium text-sm mb-2">Ordered Items</p>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-3 font-medium text-gray-700">Item</th>
                      <th className="py-2 px-3 font-medium text-gray-700">SKU</th>
                      <th className="py-2 px-3 font-medium text-gray-700 text-right">Qty</th>
                      <th className="py-2 px-3 font-medium text-gray-700 text-right">Price</th>
                      <th className="py-2 px-3 font-medium text-gray-700 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedOrder.orderedItems || selectedOrder.items || selectedOrder.products || []).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-gray-900">
                          {item.productName || item.name || item.product?.name || 'Item'}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs">{item.sku || 'N/A'}</td>
                        <td className="py-2 px-3 text-gray-600 text-right">{item.quantity || item.qty || 1}</td>
                        <td className="py-2 px-3 text-gray-900 text-right">Rs. {(item.price || 0).toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-gray-900 text-right font-medium">Rs. {(item.subtotal || (item.price * (item.quantity || 1)) || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-gray-600">Subtotal</td>
                      <td className="py-2 px-3 text-right text-gray-900">Rs. {(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    {(selectedOrder.shippingCharge > 0) && (
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-right text-gray-600">Shipping Charge</td>
                        <td className="py-2 px-3 text-right text-gray-900">Rs. {selectedOrder.shippingCharge.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right font-bold text-gray-900">Grand Total</td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">Rs. {(selectedOrder.grandTotal || selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-gray-200">
              <LoadingButton 
                type="button" 
                isLoading={isDownloadingInvoice}
                onClick={() => handleDownloadInvoice(selectedOrder._id || selectedOrder.id)} 
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-2 font-medium"
              >
                <FileText size={16} />
                Download Invoice
              </LoadingButton>
              <button 
                type="button" 
                onClick={() => setIsDetailsModalOpen(false)} 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </PageWrapper>
  );
};
