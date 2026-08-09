import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Store, Eye, Truck, RefreshCw } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import AdminModal from '../../components/common/AdminModal';
import { LoadingButton } from '../../components/common/LoadingButton';
import { CustomSelect } from '../../components/common/CustomSelect';
import { adminOrderApi } from '../../services/admin/adminOrder.Api';
import { adminStoreApi } from '../../services/admin/adminStore.Api';
import { productsApi } from '../../services/productsApi';
import { adminInventoryApi } from '../../services/admin/adminInventory.Api';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../app/hooks';
import { selectIsAdmin, selectIsStoreManager } from '../../features/auth/authSlice';

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export const AdminOrders = () => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const isStoreManager = useAppSelector(selectIsStoreManager);
  const [statusFilter, setStatusFilter] = useState('All');
  const [storeFilter, setStoreFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // State for Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Assign Store Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<any>(null);
  const [availableStores, setAvailableStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [isAssigningStore, setIsAssigningStore] = useState(false);
  const [assignStoreError, setAssignStoreError] = useState('');

  // Tracking Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [orderToTrack, setOrderToTrack] = useState<any>(null);
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: '',
    courierName: '',
    estimatedDeliveryDate: ''
  });
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [refundError, setRefundError] = useState('');

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingReject, setIsProcessingReject] = useState(false);
  const [rejectError, setRejectError] = useState('');
  const [isProcessingAcceptId, setIsProcessingAcceptId] = useState<string | null>(null);

  // Store Stock Levels
  const [storeStockLevels, setStoreStockLevels] = useState<Record<string, number>>({});
  const [isFetchingStock, setIsFetchingStock] = useState(false);

  useEffect(() => {
    const fetchStockLevels = async () => {
      if (!isStoreModalOpen || !orderToAssign || !selectedStoreId) {
        setStoreStockLevels({});
        return;
      }
      setIsFetchingStock(true);
      const newStockLevels: Record<string, number> = {};
      const items = orderToAssign.orderedItems || orderToAssign.items || orderToAssign.products || [];

      try {
        await Promise.all(items.map(async (item: any) => {
          const variantId = item.variantId || item.variant?._id || item.variant?.id || item.variant;
          const productId = item.productId || item.product?._id || item.product?.id || item.product;

          if (!variantId && !productId) return;
          const key = variantId || productId;

          try {
            const params: any = {
              'filters[storeId]': selectedStoreId,
              limit: 1,
              sort: '-createdAt'
            };
            if (variantId && typeof variantId === 'string') {
              params['filters[variantId]'] = variantId;
            } else if (productId && typeof productId === 'string') {
              params['filters[productId]'] = productId;
            }

            const res = await adminInventoryApi.getTransactions(params);
            const latestTx = res.data?.[0] || (res.data?.data && res.data.data[0]);

            if (latestTx && latestTx.currentQuantity !== undefined) {
              newStockLevels[key as string] = latestTx.currentQuantity;
            } else {
              newStockLevels[key as string] = 0;
            }
          } catch (e) {
            newStockLevels[key as string] = 0;
          }
        }));
        setStoreStockLevels(newStockLevels);
      } catch (error) {
        console.error('Failed to fetch stock levels', error);
      } finally {
        setIsFetchingStock(false);
      }
    };

    fetchStockLevels();
  }, [selectedStoreId, isStoreModalOpen, orderToAssign]);

  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  // Product Details Modal State
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [fullProductDetails, setFullProductDetails] = useState<any>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // The user specified limit=50 in the API request

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

  const handleStatusChange = async (order: any, newStatus: string) => {
    const orderId = order._id || order.id;
    try {
      await adminOrderApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Failed to update status', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openDetailsModal = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const openProductDetails = async (item: any) => {
    setSelectedProduct(item);
    setIsProductDetailsOpen(true);
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

  const openTrackingModal = (order: any) => {
    setOrderToTrack(order);
    setTrackingForm({
      trackingNumber: order.trackingNumber || '',
      courierName: order.courierName || '',
      estimatedDeliveryDate: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().slice(0, 16) : ''
    });
    setTrackingError('');
    setIsTrackingModalOpen(true);
  };

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToTrack) return;
    setIsUpdatingTracking(true);
    setTrackingError('');
    try {
      const formattedDate = trackingForm.estimatedDeliveryDate ? new Date(trackingForm.estimatedDeliveryDate).toISOString() : undefined;
      const response = await adminOrderApi.updateOrderTracking(orderToTrack._id || orderToTrack.id, {
        ...trackingForm,
        estimatedDeliveryDate: formattedDate
      });
      setIsTrackingModalOpen(false);
      toast.success(response?.message || 'Courier staff assigned successfully');
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to update tracking', error);
      setTrackingError(error.response?.data?.message || 'Failed to assign courier staff');
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const openRefundModal = (order: any) => {
    setOrderToRefund(order);
    setRefundReason('');
    setRefundError('');
    setIsRefundModalOpen(true);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToRefund) return;
    
    setIsProcessingRefund(true);
    setRefundError('');
    try {
      const orderIdString = orderToRefund._id || orderToRefund.id;
      
      await adminOrderApi.refundPayment(orderIdString, undefined, refundReason);
      toast.success('Refund processed successfully.');
      
      setIsRefundModalOpen(false);
      fetchOrders(); 
    } catch (error: any) {
      console.error('Failed to process refund', error);
      setRefundError(error.response?.data?.message || 'Failed to process request');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleAcceptPayment = async (orderId: string) => {
    setIsProcessingAcceptId(orderId);
    try {
      const response: any = await adminOrderApi.acceptPayment(orderId);

      if (response && response.success === false) {
        toast.error(response.message || 'Failed to accept payment');
        fetchOrders();
        return;
      }

      toast.success(response?.message || 'Payment accepted and captured successfully.');
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to accept payment', error);
      toast.error(error.response?.data?.message || 'Failed to accept payment');
      fetchOrders(); // Refresh in case it's already expired or actioned
    } finally {
      setIsProcessingAcceptId(null);
    }
  };

  const openRejectModal = (order: any) => {
    setOrderToReject(order);
    setRejectReason('');
    setRejectError('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToReject) return;
    
    setIsProcessingReject(true);
    setRejectError('');
    try {
      const orderIdString = orderToReject._id || orderToReject.id;

      const response: any = await adminOrderApi.rejectPayment(orderIdString, rejectReason);

      if (response && response.success === false) {
        setRejectError(response.message || 'Failed to decline payment');
        return;
      }

      toast.success(response?.message || 'Payment declined. Hold will release automatically.');

      setIsRejectModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to process reject', error);
      setRejectError(error.response?.data?.message || 'Failed to decline payment');
    } finally {
      setIsProcessingReject(false);
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
        <div className="flex items-center gap-2 w-full sm:w-auto relative z-10">
          <Filter size={16} className="text-gray-500 shrink-0" />
          {isAdmin && (
            <CustomSelect
              name="storeFilter"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              options={[
                { value: '', label: 'All Stores' },
                ...availableStores.map(store => ({ value: store._id || store.id, label: store.name }))
              ]}
              className="w-full sm:w-40"
            />
          )}
          <CustomSelect
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={ORDER_STATUSES.map(status => ({ value: status, label: status }))}
            className="w-full sm:w-36"
          />
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
                      {(order.orderedItems || order.items || order.products || []).map((item: any, i: number) => {
                        const imgSrc =
                          item.image ||
                          item.imageUrl ||
                          item.thumbnail ||
                          item.photo ||
                          item.productId?.images?.[0] ||
                          item.productId?.image ||
                          item.productId?.thumbnail ||
                          item.variantId?.images?.[0] ||
                          item.variantId?.image ||
                          item.product?.images?.[0] ||
                          item.product?.image ||
                          item.product?.thumbnail ||
                          item.variant?.images?.[0] ||
                          item.variant?.image ||
                          null;
                        return (
                          <div
                            key={i}
                            onClick={() => openProductDetails(item)}
                            className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                          >
                            {imgSrc && (
                              <img src={imgSrc} alt="thumbnail" className="w-6 h-6 object-cover rounded" />
                            )}
                            <span className="truncate max-w-[120px] font-medium text-gray-700" title={item.productName || item.name || item.productId?.name || item.product?.name || 'Item'}>
                              {item.productName || item.name || item.productId?.name || item.product?.name || 'Item'}
                            </span>
                            <span className="text-gray-400">x{item.quantity || item.qty || 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">Rs. {(order.grandTotal || order.totalAmount || order.total || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4">
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
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
                      {order.paymentStatus === 'Authorized' ? (
                        <>
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => handleAcceptPayment(order._id || order.id)} 
                                disabled={isProcessingAcceptId === (order._id || order.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                              >
                                {isProcessingAcceptId === (order._id || order.id) ? 'Accepting...' : 'Accept'}
                              </button>
                              <button 
                                onClick={() => openRejectModal(order)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-md transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <button onClick={() => openStoreModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 rounded-md transition-colors">
                              <Store size={14} />
                              {order.store || order.storeId ? 'Reassign' : 'Assign'}
                            </button>
                          )}
                          {isStoreManager && (
                            <button onClick={() => openTrackingModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-white hover:bg-teal-600 bg-teal-50 rounded-md transition-colors whitespace-nowrap">
                              <Truck size={14} />
                              Assign Courier
                            </button>
                          )}
                          {isAdmin && (order.status === 'Cancelled' || order.status === 'Returned') && ['Completed', 'Paid', 'Success'].includes(order.paymentStatus || '') && (
                            <button onClick={() => openRefundModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 rounded-md transition-colors">
                              <RefreshCw size={14} />
                              Refund
                            </button>
                          )}
                        </>
                      )}
                      <button onClick={() => openDetailsModal(order)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 rounded-md transition-colors">
                        <Eye size={14} />
                        View
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

          {selectedStoreId && orderToAssign && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Stock in Selected Store</h4>
              {isFetchingStock ? (
                <p className="text-xs text-gray-500 animate-pulse">Checking inventory...</p>
              ) : (
                <ul className="space-y-1">
                  {(orderToAssign.orderedItems || orderToAssign.items || orderToAssign.products || []).map((item: any, i: number) => {
                    const variantId = item.variantId || item.variant?._id || item.variant?.id || item.variant;
                    const productId = item.productId || item.product?._id || item.product?.id || item.product;
                    const key = variantId || productId;
                    const stock = storeStockLevels[key as string];
                    const orderedQty = item.quantity || item.qty || 1;
                    const name = item.productName || item.name || item.product?.name || 'Item';
                    const hasEnough = stock !== undefined && stock >= orderedQty;

                    return (
                      <li key={i} className="flex justify-between items-center text-xs border-b border-gray-100 pb-1 last:border-0 last:pb-0">
                        <span className="text-gray-600 truncate pr-2" title={name}>{name} (Req: {orderedQty})</span>
                        <span className={`font-medium whitespace-nowrap ${hasEnough ? 'text-green-600' : 'text-red-600'}`}>
                          Stock: {stock !== undefined ? stock : '0'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

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
                      <tr key={idx} onClick={() => openProductDetails(item)} className="cursor-pointer hover:bg-gray-50 transition-colors">
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
                    {(selectedOrder.discount > 0) && (
                      <tr>
                        <td colSpan={4} className="py-2 px-3">
                          <div className="flex justify-end items-center gap-2 text-right text-gray-600">
                            <span>Discount</span>
                            {selectedOrder.couponId && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                {selectedOrder.couponId.code} ({selectedOrder.couponId.type === 'percentage' ? `${selectedOrder.couponId.value}% OFF` : `Rs. ${selectedOrder.couponId.value} OFF`})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-green-600 font-medium">-Rs. {(selectedOrder.discount || 0).toLocaleString('en-IN')}</td>
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

      <AdminModal
        isOpen={isProductDetailsOpen}
        onClose={() => setIsProductDetailsOpen(false)}
        title="Product Details"
      >
        {selectedProduct && (() => {
          const displayProduct = fullProductDetails || selectedProduct.product || selectedProduct.productId || selectedProduct;
          
          const image = 
            selectedProduct.image ||
            selectedProduct.imageUrl ||
            selectedProduct.thumbnail ||
            selectedProduct.photo ||
            displayProduct?.images?.[0] ||
            displayProduct?.image ||
            displayProduct?.thumbnail ||
            selectedProduct.variantId?.images?.[0] ||
            selectedProduct.variantId?.image ||
            selectedProduct.variant?.images?.[0] ||
            selectedProduct.variant?.image ||
            null;
            
          const name = 
            selectedProduct.productName || 
            selectedProduct.name || 
            displayProduct?.name || 
            displayProduct?.productName || 
            'Unknown Item';
            
          const sku = 
            selectedProduct.sku || 
            selectedProduct.variantId?.sku || 
            selectedProduct.variant?.sku || 
            displayProduct?.sku || 
            'N/A';
            
          const price = selectedProduct.price || displayProduct?.price || 0;

          return (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-24 h-32 bg-gray-100 border border-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="Product" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{name}</h4>
                  <p className="text-sm text-gray-600 mt-1">SKU: {sku}</p>
                  <p className="text-sm text-gray-600">Quantity Ordered: {selectedProduct.quantity || selectedProduct.qty || 1}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">Price: Rs. {price.toLocaleString('en-IN')}</p>
                  {selectedProduct.color && <p className="text-sm text-gray-600">Ordered Color: {selectedProduct.color}</p>}
                  {selectedProduct.size && <p className="text-sm text-gray-600">Ordered Size: {selectedProduct.size}</p>}

                  {isFetchingProduct && <p className="text-xs text-blue-500 mt-2 animate-pulse">Loading full details...</p>}

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
              <div className="pt-4 flex justify-end border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsProductDetailsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )
        })()}
      </AdminModal>

      <AdminModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        title="Assign Courier Staff"
      >
        <form className="space-y-4" onSubmit={handleTrackingSubmit}>
          {trackingError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {trackingError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
            <input
              type="text"
              value={trackingForm.courierName}
              onChange={e => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
              placeholder="e.g. BlueDart"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingForm.trackingNumber}
              onChange={e => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
              placeholder="e.g. AWB987654321IN"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date & Time</label>
            <input
              type="datetime-local"
              value={trackingForm.estimatedDeliveryDate}
              onChange={e => setTrackingForm({ ...trackingForm, estimatedDeliveryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
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
              isLoading={isUpdatingTracking}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Assign Courier
            </LoadingButton>
          </div>
        </form>
      </AdminModal>
      <AdminModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Refund Order"
      >
        <form className="space-y-4" onSubmit={handleRefundSubmit}>
          {refundError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {refundError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refund (Optional)</label>
            <textarea
              value={refundReason}
              onChange={e => setRefundReason(e.target.value)}
              placeholder="e.g. Customer requested refund"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <LoadingButton
              type="submit"
              isLoading={isProcessingRefund}
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
            >
              Confirm Refund
            </LoadingButton>
          </div>
        </form>
      </AdminModal>
      <AdminModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Decline Payment"
      >
        <form className="space-y-4" onSubmit={handleRejectSubmit}>
          {rejectError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {rejectError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Decline (Optional)</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Suspected fraud, out of stock"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Note: The payment will be declined and the hold on the customer's account will release automatically.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isProcessingReject}
              className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
            >
              Decline Payment
            </LoadingButton>
          </div>
        </form>
      </AdminModal>
    </PageWrapper>
  );
};
