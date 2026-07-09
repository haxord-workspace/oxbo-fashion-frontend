import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Store as StoreIcon, Loader2 } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminStoreApi } from '../../services/admin/adminStore.Api';
import type { Store } from '../../types';
import toast from 'react-hot-toast';

export const AdminStores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [stores, setStores] = useState<Store[]>([]);
  const [totalStores, setTotalStores] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminStoreApi.getStores({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery
      });
      setStores(data.stores);
      setTotalStores(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const openModal = (mode: 'add' | 'edit', store: any = null) => {
    setModalMode(mode);
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    
    try {
      const response = await adminStoreApi.deleteStore(storeId);
      toast.success(response.message || 'Store deleted successfully');
      setStores(stores.filter(s => (s._id || s.id) !== storeId));
      setTotalStores(prev => prev - 1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete store');
    }
  };

  const totalPages = Math.ceil(totalStores / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <PageWrapper 
        title="Store Locations"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add Store</span>
          </button>
        }
      >
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search stores..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 flex justify-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading stores...</span>
            </div>
          ) : stores.length > 0 ? (
            stores.map(store => (
              <div key={store._id || store.id} className="border border-gray-200 rounded-lg p-5 flex flex-col hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                      <StoreIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{store.name}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-gray-500`}>
                        {store.type || 'Store'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal('edit', store)} className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteStore(store._id || store.id || '')}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mt-2">
                  <div className="flex justify-between">
                    <span>Store Code:</span>
                    <span className="font-medium text-gray-900">{store.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-gray-900">{store.address?.city || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium text-gray-900">{store.email}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                    <span>Phone:</span>
                    <span className="font-medium text-black">{store.phone}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
              No stores found matching your search.
            </div>
          )}
        </div>
        
        {totalStores > 0 && (
          <div className="mt-6">
            <AdminPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalStores}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Store' : 'Edit Store'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input type="text" defaultValue={selectedStore?.name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="E.g., Downtown Main Hub" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
              <input type="text" defaultValue={selectedStore?.location || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="City, State" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select defaultValue={selectedStore?.status || 'Active'} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
            <input type="text" defaultValue={selectedStore?.manager || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="Manager Name" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Store</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
