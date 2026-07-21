import { useState, useEffect } from 'react';
import { Search, Filter, Truck, FileText, Store } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import AdminModal from '../../components/common/AdminModal';
import { LoadingButton } from '../../components/common/LoadingButton';
import { adminOrderApi } from '../../services/admin/adminOrder.Api';
import { adminStoreApi } from '../../services/admin/adminStore.Api';

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export const AdminOrders = () => {
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

  const handleDownloadInvoice = async (orderId: string) => {
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
    }
  };

  const openStoreModal = async (order: any) => {
    setOrderToAssign(order);
    setSelectedStoreId(order.store?._id || order.store || '');
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
    try {
      await adminOrderApi.assignStore(orderToAssign._id || orderToAssign.id, selectedStoreId);
      setIsStoreModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to assign store', error);
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
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select 
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="">All Stores</option>
            {availableStores.map(store => (
              <option key={store._id || store.id} value={store._id || store.id}>{store.name}</option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-black cursor-pointer"
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
              <th className="pb-3 font-medium px-4">Total</th>
              <th className="pb-3 font-medium px-4">Status</th>
              <th className="pb-3 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No orders found matching your filters.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id || order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{order.customer?.name || order.userId?.name || 'Guest'}</p>
                    <p className="text-xs text-gray-500">{order.customer?.email || order.userId?.email || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-medium">Rs. {(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4">
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-1 focus:ring-black outline-none
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        ['Processing', 'Confirmed', 'Packed'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                        ['Shipped', 'Out for Delivery'].includes(order.status) ? 'bg-purple-100 text-purple-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {ORDER_STATUSES.filter(s => s !== 'All').map(status => (
                        <option key={status} value={status} className="bg-white text-black">{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openStoreModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 rounded-md transition-colors">
                        <Store size={14} />
                        Store
                      </button>
                      <button onClick={() => handleDownloadInvoice(order._id || order.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-md transition-colors">
                        <FileText size={14} />
                        Invoice
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${trackingErrors.courierName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black'}`} 
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${trackingErrors.trackingNumber ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black'}`} 
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 ${trackingErrors.estimatedDeliveryDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black'}`} 
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
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Update Tracking
            </LoadingButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        title="Assign Store"
      >
        <form className="space-y-4" onSubmit={handleAssignStoreSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Store</label>
            <select 
              value={selectedStoreId} 
              onChange={e => setSelectedStoreId(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
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
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Assign Store
            </LoadingButton>
          </div>
        </form>
      </AdminModal>
    </PageWrapper>
  );
};
