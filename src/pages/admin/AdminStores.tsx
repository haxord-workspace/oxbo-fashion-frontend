import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Store } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

const mockAdminStores = [
  { id: 'ST-001', name: 'Downtown Main Hub', location: 'New York, NY', status: 'Active', manager: 'Alice Smith', inventoryCount: 1542 },
  { id: 'ST-002', name: 'Uptown Boutique', location: 'New York, NY', status: 'Active', manager: 'Bob Johnson', inventoryCount: 890 },
  { id: 'ST-003', name: 'Westside Outlet', location: 'Los Angeles, CA', status: 'Inactive', manager: 'Charlie Davis', inventoryCount: 0 },
];

export const AdminStores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedStore, setSelectedStore] = useState<any>(null);

  const openModal = (mode: 'add' | 'edit', store: any = null) => {
    setModalMode(mode);
    setSelectedStore(store);
    setIsModalOpen(true);
  };

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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAdminStores.map(store => (
            <div key={store.id} className="border border-gray-200 rounded-lg p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                    <Store size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{store.name}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${store.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {store.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal('edit', store)} className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mt-2">
                <div className="flex justify-between">
                  <span>Store ID:</span>
                  <span className="font-medium text-gray-900">{store.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium text-gray-900">{store.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manager:</span>
                  <span className="font-medium text-gray-900">{store.manager}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                  <span>Inventory Items:</span>
                  <span className="font-medium text-black">{store.inventoryCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
