import { useState, useEffect } from 'react';
import { Plus, Minus, Edit, Lock, Unlock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import AdminModal from '../../components/common/AdminModal';
import { LoadingButton } from '../../components/common/LoadingButton';
import { CustomSelect } from '../../components/common/CustomSelect';
import { adminInventoryApi } from '../../services/admin/adminInventory.Api';
import { adminStoreApi } from '../../services/admin/adminStore.Api';
import { adminProductApi } from '../../services/admin/adminProduct.Api';

export const AdminInventory = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: itemsPerPage, search: searchQuery };
      if (storeFilter) {
        params['filters[storeId]'] = storeFilter;
      }
      const res = await adminInventoryApi.getTransactions(params);
      setTransactions(res.data?.data || []);
      setTotalItems(res.data?.total || 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 1) {
      fetchTransactions();
    } else {
      setCurrentPage(1);
    }
  }, [storeFilter]);

  // Fetch stores on mount for filter dropdown
  useEffect(() => {
    const fetchStoresForFilter = async () => {
      try {
        const storeRes = await adminStoreApi.getStores();
        setStores(storeRes.stores || []);
      } catch (e) {}
    };
    fetchStoresForFilter();
  }, []);

  const handleSearch = () => {
    if (currentPage === 1) {
      fetchTransactions();
    } else {
      setCurrentPage(1);
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const openDetailsModal = async (id: string) => {
    setIsDetailsModalOpen(true);
    setIsLoadingDetails(true);
    try {
      const res = await adminInventoryApi.getTransactionById(id);
      setSelectedTransactionDetails(res.data);
    } catch (error: any) {
      toast.error('Failed to load transaction details');
      setIsDetailsModalOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };
  
  // Options State for Dropdowns
  const [stores, setStores] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [stockForm, setStockForm] = useState({
    storeId: '',
    variantId: '',
    quantity: 0,
    remarks: '',
    action: 'add' as 'add' | 'reduce' | 'adjust' | 'reserve' | 'release'
  });

  const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false);
  const [variantSearchQuery, setVariantSearchQuery] = useState('');

  const filteredVariants = variantSearchQuery.trim()
    ? variants.filter(v => {
        const q = variantSearchQuery.trim().toLowerCase();
        const haystack = [
          v.productName,
          v.sku,
          v.attributes?.color,
          v.attributes?.size
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(q);
      })
    : variants;

  const loadOptions = async () => {
    if (stores.length === 0 || variants.length === 0) {
      setIsLoadingOptions(true);
      try {
        const storeRes = await adminStoreApi.getStores();
        setStores(storeRes.stores || []);
        
        const prodRes = await adminProductApi.getProducts();
        const allProducts = prodRes.products || [];
        
        let allVariants: any[] = [];
        await Promise.all(allProducts.map(async (p: any) => {
           try {
             const vRes = await adminProductApi.getVariants(p._id || p.id);
             const prodVariants = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
             prodVariants.forEach((v: any) => {
               allVariants.push({
                 id: v._id || v.id,
                 sku: v.sku,
                 productName: p.name,
                 attributes: v.attributes,
                 image: p.thumbnail
               });
             });
           } catch (e) {
             // Silently continue if variants fail for a product
           }
        }));
        setVariants(allVariants);
      } catch (err) {
        console.error('Failed to load options', err);
        toast.error('Failed to load stores and variants options');
      } finally {
        setIsLoadingOptions(false);
      }
    }
  };

  const openUpdateModal = async () => {
    setEditingTransactionId(null);
    setStockForm({
      storeId: '',
      variantId: '',
      quantity: 0,
      remarks: '',
      action: 'add'
    });
    setIsModalOpen(true);
    await loadOptions();
  };

  const openIndividualUpdateModal = async (transaction: any) => {
    setEditingTransactionId(transaction._id || transaction.id);
    setStockForm({
      storeId: transaction.storeId?._id || transaction.storeId || '',
      variantId: transaction.variantId?._id || transaction.variantId || '',
      quantity: 0,
      remarks: '',
      action: 'adjust'
    });
    setIsModalOpen(true);
    await loadOptions();
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockForm.storeId || !stockForm.variantId || stockForm.quantity === 0) {
      toast.error('Please select a store, variant, and set a valid quantity');
      return;
    }
    
    setIsUpdating(true);
    try {
      const basePayload: any = {
        storeId: stockForm.storeId,
        variantId: stockForm.variantId,
        quantity: Number(stockForm.quantity),
      };
      if (editingTransactionId) {
        basePayload.id = editingTransactionId;
      }
      const fullPayload = { ...basePayload, remarks: stockForm.remarks };

      if (stockForm.action === 'add') {
        await adminInventoryApi.addStock(fullPayload);
        toast.success('Stock added successfully');
      } else if (stockForm.action === 'reduce') {
        await adminInventoryApi.reduceStock(fullPayload);
        toast.success('Stock reduced successfully');
      } else if (stockForm.action === 'adjust') {
        await adminInventoryApi.adjustStock(fullPayload);
        toast.success('Stock adjusted successfully');
      } else if (stockForm.action === 'reserve') {
        await adminInventoryApi.reserveStock(basePayload);
        toast.success('Stock reserved successfully');
      } else if (stockForm.action === 'release') {
        await adminInventoryApi.releaseStock(basePayload);
        toast.success('Stock released successfully');
      }
      setIsModalOpen(false);
      fetchTransactions(); // Refresh the list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <PageWrapper 
        title="Inventory Transactions"
        headerAction={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto relative z-10 mt-4 sm:mt-0">
          <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden shrink-0 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search SKU or Product..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="px-3 py-2 text-sm focus:outline-none w-full sm:w-56"
            />
            <button onClick={handleSearch} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border-l border-gray-300 text-sm font-medium shrink-0">Search</button>
          </div>
          <CustomSelect
            name="storeFilter"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            options={[
              { value: '', label: 'All Stores' },
              ...stores.map(store => ({ value: store._id || store.id, label: store.name }))
            ]}
            className="w-full sm:w-48"
          />
          <button 
            onClick={openUpdateModal}
            className="flex justify-center items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shrink-0 w-full sm:w-auto"
            >
              <span className="text-sm font-medium">Update Stock</span>
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium px-4">Date</th>
                <th className="pb-3 font-medium px-4">Store</th>
                <th className="pb-3 font-medium px-4">Product / SKU</th>
                <th className="pb-3 font-medium px-4">Type</th>
                <th className="pb-3 font-medium px-4">Change</th>
                <th className="pb-3 font-medium px-4">Current Stock</th>
                <th className="pb-3 font-medium px-4">Remarks</th>
                <th className="pb-3 font-medium px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">Loading transactions...</td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map(item => (
                  <tr 
                    key={item._id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openDetailsModal(item._id)}
                  >
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()} <br/>
                      <span className="text-xs">{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">{item.storeId?.name || item.storeId}</td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{item.variantId?.sku}</div>
                      {item.variantId?.attributes && (
                        <div className="text-xs text-gray-500">
                          {item.variantId.attributes.color} / {item.variantId.attributes.size}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                        ${item.type === 'Stock In' ? 'bg-green-100 text-green-700' : 
                          item.type === 'Stock Out' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <span className={item.quantity > 0 ? 'text-green-600' : item.quantity < 0 ? 'text-red-600' : 'text-gray-600'}>
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">{item.currentQuantity}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs max-w-xs truncate" title={item.remarks}>{item.remarks || '-'}</td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openIndividualUpdateModal(item);
                        }}
                        className="text-gray-500 hover:text-primary transition-colors p-1"
                        title="Edit / Adjust Stock"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalItems > 0 && (
          <AdminPagination 
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Inventory Stock"
      >
        <form onSubmit={handleUpdateStock} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setStockForm({ ...stockForm, action: 'add' })}
              className={`flex items-center justify-center gap-2 py-2 border rounded-md transition-colors ${stockForm.action === 'add' ? 'bg-green-50 border-green-500 text-green-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Plus size={16} /> Add
            </button>
            <button
              type="button"
              onClick={() => setStockForm({ ...stockForm, action: 'reduce' })}
              className={`flex items-center justify-center gap-2 py-2 border rounded-md transition-colors ${stockForm.action === 'reduce' ? 'bg-red-50 border-red-500 text-red-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Minus size={16} /> Reduce
            </button>
            <button
              type="button"
              onClick={() => setStockForm({ ...stockForm, action: 'adjust' })}
              className={`flex items-center justify-center gap-2 py-2 border rounded-md transition-colors ${stockForm.action === 'adjust' ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Edit size={16} /> Adjust
            </button>
            <button
              type="button"
              onClick={() => setStockForm({ ...stockForm, action: 'reserve' })}
              className={`flex items-center justify-center gap-2 py-2 border rounded-md transition-colors ${stockForm.action === 'reserve' ? 'bg-orange-50 border-orange-500 text-orange-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Lock size={16} /> Reserve
            </button>
            <button
              type="button"
              onClick={() => setStockForm({ ...stockForm, action: 'release' })}
              className={`flex items-center justify-center gap-2 py-2 border rounded-md transition-colors col-span-2 ${stockForm.action === 'release' ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Unlock size={16} /> Release
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select 
              value={stockForm.storeId} 
              onChange={e => setStockForm({...stockForm, storeId: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white disabled:bg-gray-100"
              disabled={isLoadingOptions}
            >
              <option value="">{isLoadingOptions ? 'Loading stores...' : 'Select a store'}</option>
              {stores.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
            <div 
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white flex justify-between items-center ${isLoadingOptions ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
              onClick={() => !isLoadingOptions && setIsVariantDropdownOpen(!isVariantDropdownOpen)}
            >
              <span className="truncate">
                {isLoadingOptions ? 'Loading variants...' : 
                 stockForm.variantId ? 
                  (() => {
                    const v = variants.find(v => v.id === stockForm.variantId);
                    return v ? `${v.productName} - ${v.sku} ${v.attributes ? `(${v.attributes.color || ''}${v.attributes.color && v.attributes.size ? ', ' : ''}${v.attributes.size || ''})` : ''}` : 'Select a variant';
                  })() : 
                  'Select a variant'}
              </span>
              <span className="text-gray-400 text-xs">▼</span>
            </div>
            
            {isVariantDropdownOpen && !isLoadingOptions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setIsVariantDropdownOpen(false);
                    setVariantSearchQuery('');
                  }}
                ></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <input
                      type="text"
                      autoFocus
                      value={variantSearchQuery}
                      onChange={e => setVariantSearchQuery(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      placeholder="Search by product, SKU, color, size..."
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div className="overflow-auto">
                  <div
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500"
                    onClick={() => {
                      setStockForm({...stockForm, variantId: ''});
                      setIsVariantDropdownOpen(false);
                      setVariantSearchQuery('');
                    }}
                  >
                    Select a variant
                  </div>
                  {filteredVariants.length === 0 && (
                    <div className="px-3 py-4 text-sm text-gray-400 text-center">No variants match "{variantSearchQuery}"</div>
                  )}
                  {filteredVariants.map(v => (
                    <div 
                      key={v.id}
                      className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center gap-3 ${stockForm.variantId === v.id ? 'bg-gray-50 font-medium' : ''}`}
                      onClick={() => {
                        setStockForm({...stockForm, variantId: v.id});
                        setIsVariantDropdownOpen(false);
                        setVariantSearchQuery('');
                      }}
                    >
                      {v.image ? (
                        <img src={v.image} alt={v.productName} className="w-8 h-8 object-cover rounded border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400">
                          -
                        </div>
                      )}
                      <div>
                        <div className="text-gray-900">{v.productName} - {v.sku}</div>
                        {v.attributes && (
                          <div className="text-xs text-gray-500">
                            {v.attributes.color || ''}{v.attributes.color && v.attributes.size ? ', ' : ''}{v.attributes.size || ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input 
              type="number" 
              value={stockForm.quantity || ''} 
              onChange={e => setStockForm({...stockForm, quantity: Number(e.target.value)})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
              placeholder="e.g. 10 or -5"
            />
          </div>

          {['add', 'reduce', 'adjust'].includes(stockForm.action) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea 
                value={stockForm.remarks} 
                onChange={e => setStockForm({...stockForm, remarks: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm resize-none"
                placeholder="e.g. Initial stock shipment"
                rows={2}
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <LoadingButton type="submit" isLoading={isUpdating} disabled={isLoadingOptions} className={`px-4 py-2 text-white rounded-md transition-colors bg-primary hover:bg-gray-800 disabled:bg-gray-400`}>
              Confirm {stockForm.action.charAt(0).toUpperCase() + stockForm.action.slice(1)}
            </LoadingButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Transaction Details"
      >
        {isLoadingDetails ? (
          <div className="py-8 text-center text-gray-500">Loading details...</div>
        ) : selectedTransactionDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-2">Store Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedTransactionDetails.storeId?.name}</p>
                  <p><span className="font-medium">Code:</span> {selectedTransactionDetails.storeId?.code}</p>
                  <p><span className="font-medium">Email:</span> {selectedTransactionDetails.storeId?.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedTransactionDetails.storeId?.phone}</p>
                  {selectedTransactionDetails.storeId?.address && (
                    <p><span className="font-medium">Address:</span> {selectedTransactionDetails.storeId.address.addressLine1}, {selectedTransactionDetails.storeId.address.city}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-2">Transaction Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Type:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedTransactionDetails.type === 'Stock In' ? 'bg-green-100 text-green-700' : selectedTransactionDetails.type === 'Stock Out' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{selectedTransactionDetails.type}</span></p>
                  <p><span className="font-medium">Quantity Change:</span> <span className={selectedTransactionDetails.quantity > 0 ? 'text-green-600 font-medium' : selectedTransactionDetails.quantity < 0 ? 'text-red-600 font-medium' : 'font-medium'}>{selectedTransactionDetails.quantity > 0 ? `+${selectedTransactionDetails.quantity}` : selectedTransactionDetails.quantity}</span></p>
                  <p><span className="font-medium">Previous Quantity:</span> {selectedTransactionDetails.previousQuantity}</p>
                  <p><span className="font-medium">Current Quantity:</span> {selectedTransactionDetails.currentQuantity}</p>
                  <p><span className="font-medium">Remarks:</span> {selectedTransactionDetails.remarks || '-'}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedTransactionDetails.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Created By:</span> {selectedTransactionDetails.createdBy ? `${selectedTransactionDetails.createdBy.firstName} ${selectedTransactionDetails.createdBy.lastName}` : 'System'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-2">Variant Details</h3>
              <div className="flex gap-4">
                {selectedTransactionDetails.variantId?.images?.[0] && (
                  <img src={selectedTransactionDetails.variantId.images[0]} alt="Variant" className="w-24 h-24 object-cover rounded-md border" />
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">SKU:</span> {selectedTransactionDetails.variantId?.sku}</p>
                  <p><span className="font-medium">Barcode:</span> {selectedTransactionDetails.variantId?.barcode || '-'}</p>
                  <p><span className="font-medium">Price:</span> ${selectedTransactionDetails.variantId?.price}</p>
                  <p><span className="font-medium">Sale Price:</span> ${selectedTransactionDetails.variantId?.salePrice || '-'}</p>
                  {selectedTransactionDetails.variantId?.attributes && (
                    <p><span className="font-medium">Attributes:</span> {Object.entries(selectedTransactionDetails.variantId.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-gray-200">
              <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">Details not available.</div>
        )}
      </AdminModal>
    </>
  );
};
