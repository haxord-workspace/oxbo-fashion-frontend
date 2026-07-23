import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Store as StoreIcon, Loader2, Shield } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminStoreApi } from '../../services/admin/adminStore.Api';
import { adminUserApi } from '../../services/admin/adminUser.Api';
import type { Store, User } from '../../types';
import toast from 'react-hot-toast';

interface FormErrors {
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
}

export const AdminStores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [stores, setStores] = useState<Store[]>([]);
  const [totalStores, setTotalStores] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAdminsModalOpen, setIsAdminsModalOpen] = useState(false);
  const [storeAdmins, setStoreAdmins] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIdToAssign, setSelectedUserIdToAssign] = useState('');
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [isAdminsLoading, setIsAdminsLoading] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    type: 'store',
    status: 'active',
    address: {
      addressLine1: '',
      city: ''
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await adminStoreApi.getStores(params);
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

  const openModal = (mode: 'add' | 'edit' | 'delete', store: any = null) => {
    setModalMode(mode);
    setSelectedStore(store);
    if (mode === 'edit' && store) {
      setStoreForm({
        name: store.name || '',
        code: store.code || '',
        email: store.email || '',
        phone: store.phone || '',
        type: store.type || 'store',
        status: store.status || 'active',
        address: {
          addressLine1: store.address?.addressLine1 || '',
          city: store.address?.city || ''
        }
      });
    } else {
      setStoreForm({
        name: '',
        code: '',
        email: '',
        phone: '',
        type: 'store',
        status: 'active',
        address: {
          addressLine1: '',
          city: ''
        }
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!storeForm.name.trim()) newErrors.name = 'Store name is required';
    if (!storeForm.code.trim()) newErrors.code = 'Store code is required';
    if (!storeForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(storeForm.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!storeForm.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!storeForm.address.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!storeForm.address.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      // Omit status from the payload as the backend doesn't expect it in the body
      const { status, ...storePayload } = storeForm;

      if (modalMode === 'add') {
        const response = await adminStoreApi.createStore(storePayload as any);
        toast.success(response.message || 'Store created successfully');
        if (response.store) {
          setStores([response.store, ...stores]);
          setTotalStores(prev => prev + 1);
        } else {
          fetchStores();
        }
      } else if (modalMode === 'edit' && selectedStore) {
        const storeId = selectedStore._id || selectedStore.id;
        // The backend doesn't allow updating the store code
        const { code, ...updatePayload } = storePayload;
        const response = await adminStoreApi.updateStore(storeId, updatePayload as any);
        
        // Handle status changes using specific endpoints
        if (status !== selectedStore.status) {
          try {
            if (status === 'active') {
              await adminStoreApi.activateStore(storeId);
            } else {
              await adminStoreApi.deactivateStore(storeId);
            }
          } catch (statusErr: any) {
            toast.error('Store details updated, but failed to change status');
          }
        }

        toast.success(response.message || 'Store updated successfully');
        setStores(stores.map(s => (s._id || s.id) === storeId ? { ...s, ...storeForm } : s));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || `Failed to ${modalMode} store`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;
    const storeId = selectedStore._id || selectedStore.id;
    
    setIsSubmitting(true);
    try {
      const response = await adminStoreApi.deleteStore(storeId);
      toast.success(response.message || 'Store deleted successfully');
      setStores(stores.filter(s => (s._id || s.id) !== storeId));
      setTotalStores(prev => prev - 1);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete store');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdminsModal = async (store: any) => {
    setSelectedStore(store);
    setStoreAdmins([]);
    setAllUsers([]);
    setIsAdminsModalOpen(true);
    setIsAdminsLoading(true);
    try {
      const storeId = store._id || store.id;
      const [adminsData, storeManagersData] = await Promise.all([
        adminStoreApi.getStoreAdmins(storeId),
        adminUserApi.getAllUsers({ role: 'Store Manager', limit: 100 }),

      ]);
      setStoreAdmins(adminsData.admins || []);
      
      const managers = storeManagersData.users || [];
      const combinedUsers = [...managers];
      
      // Filter out any potential duplicates by ID to be safe
      const uniqueUsers = Array.from(new Map(combinedUsers.map(u => [u._id || u.id, u])).values());
      setAllUsers(uniqueUsers);
    } catch (err: any) {
      toast.error('Failed to load admins data');
    } finally {
      setIsAdminsLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedUserIdToAssign || !selectedStore) return;
    setIsAdminsLoading(true);
    try {
      const storeId = selectedStore._id || selectedStore.id;
      await adminStoreApi.assignStoreAdmin(storeId, { userId: selectedUserIdToAssign, isPrimary: isPrimaryAdmin });
      toast.success('Admin assigned successfully');
      
      const adminsData = await adminStoreApi.getStoreAdmins(storeId);
      setStoreAdmins(adminsData.admins || []);
      
      setSelectedUserIdToAssign('');
      setIsPrimaryAdmin(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to assign admin');
    } finally {
      setIsAdminsLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!selectedStore) return;
    setIsAdminsLoading(true);
    try {
      const storeId = selectedStore._id || selectedStore.id;
      await adminStoreApi.removeStoreAdmin(storeId, adminId);
      toast.success('Admin removed successfully');
      
      const adminsData = await adminStoreApi.getStoreAdmins(storeId);
      setStoreAdmins(adminsData.admins || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to remove admin');
    } finally {
      setIsAdminsLoading(false);
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
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
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
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{store.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {store.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-gray-500`}>
                        {store.type || 'Store'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openAdminsModal(store)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Manage Admins">
                      <Shield size={16} />
                    </button>
                    <button onClick={() => openModal('edit', store)} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => openModal('delete', store)}
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
                    <span className="font-medium text-primary">{store.phone}</span>
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
        title={modalMode === 'add' ? 'Add New Store' : modalMode === 'edit' ? 'Edit Store' : 'Delete Store'}
      >
        {modalMode === 'delete' ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete the store <span className="font-semibold">{selectedStore?.name}</span>? This action cannot be undone.
            </p>
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" onClick={handleDeleteStore} disabled={isSubmitting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Store'}
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleStoreSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" value={storeForm.name} onChange={e => {
                setStoreForm({...storeForm, name: e.target.value});
                if (errors.name) setErrors({...errors, name: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`} placeholder="E.g., Kochi Main Hub" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Code</label>
              <input type="text" value={storeForm.code} onChange={e => {
                setStoreForm({...storeForm, code: e.target.value});
                if (errors.code) setErrors({...errors, code: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`} placeholder="E.g., kollam-01" />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={storeForm.email} onChange={e => {
                setStoreForm({...storeForm, email: e.target.value});
                if (errors.email) setErrors({...errors, email: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`} placeholder="Store Email" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={storeForm.phone} onChange={e => {
                setStoreForm({...storeForm, phone: e.target.value});
                if (errors.phone) setErrors({...errors, phone: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`} placeholder="Phone Number" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input type="text" value={storeForm.address.addressLine1} onChange={e => {
                setStoreForm({...storeForm, address: {...storeForm.address, addressLine1: e.target.value}});
                if (errors.addressLine1) setErrors({...errors, addressLine1: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary ${errors.addressLine1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`} placeholder="Street Address" />
              {errors.addressLine1 && <p className="mt-1 text-xs text-red-500">{errors.addressLine1}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={storeForm.address.city} onChange={e => {
                setStoreForm({...storeForm, address: {...storeForm.address, city: e.target.value}});
                if (errors.city) setErrors({...errors, city: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}`} placeholder="City" />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={storeForm.type} onChange={e => setStoreForm({...storeForm, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="store">Store</option>
                <option value="warehouse">Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={storeForm.status} onChange={e => setStoreForm({...storeForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Store'}
            </button>
          </div>
        </form>
        )}
      </AdminModal>

      <AdminModal
        isOpen={isAdminsModalOpen}
        onClose={() => setIsAdminsModalOpen(false)}
        title={`Manage Admins - ${selectedStore?.name}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-8">
          {/* Current Admins List */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Admins</h4>
            {isAdminsLoading && storeAdmins.length === 0 ? (
              <div className="flex justify-center py-4 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : storeAdmins.length > 0 ? (
              <div className="space-y-3">
                {storeAdmins.map(admin => {
                  const userObj = admin.userId || admin.user || admin;
                  return (
                  <div key={admin._id || admin.id || userObj._id} className="flex justify-between items-center bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100 transition-colors hover:border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="text-sm font-semibold text-gray-900">{userObj.firstName} {userObj.lastName}</span>
                      <span className="text-xs sm:text-sm text-gray-500">{userObj.email}</span>
                      {admin.isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                          Primary
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveAdmin(userObj._id || userObj.id || admin._id || admin.id || '')} 
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      disabled={isAdminsLoading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )})}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md text-center">No admins assigned to this store.</p>
            )}
          </div>

          {/* Assign New Admin */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Assign New Admin</h4>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  value={selectedUserIdToAssign} 
                  onChange={e => setSelectedUserIdToAssign(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white transition-colors"
                  disabled={isAdminsLoading}
                >
                  <option value="">Select a user to assign...</option>
                  {allUsers
                    .filter(user => {
                      // Check if not already assigned
                      const isNotAssigned = !storeAdmins.some(admin => {
                        const uId = admin.userId?._id || admin.userId || admin._id || admin.id;
                        return uId === (user._id || user.id);
                      });

                      return isNotAssigned;
                    })
                    .map(user => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))
                  }
                </select>
                <button 
                  onClick={handleAssignAdmin}
                  disabled={!selectedUserIdToAssign || isAdminsLoading}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isAdminsLoading && selectedUserIdToAssign ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Admin'}
                </button>
              </div>
              <div className="flex items-center gap-2 px-1">
                <input 
                  type="checkbox" 
                  id="isPrimaryAdmin" 
                  checked={isPrimaryAdmin} 
                  onChange={(e) => setIsPrimaryAdmin(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isPrimaryAdmin" className="text-sm text-gray-700">Set as Primary Admin</label>
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </>
  );
};
