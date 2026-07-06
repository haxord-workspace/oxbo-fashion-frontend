import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

export const AdminBanners = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  const openModal = (mode: 'add' | 'edit', banner: any = null) => {
    setModalMode(mode);
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageWrapper 
        title="Banners"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add Banner</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-32 h-16 bg-gray-200 rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300" alt="Banner" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Summer Sale Header</h4>
                <p className="text-xs text-gray-500">Placement: Home Top</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openModal('edit', { title: 'Summer Sale Header', placement: 'Home Top' })}
                className="p-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                <Edit2 size={16} />
              </button>
              <button className="p-2 border border-red-200 text-red-500 rounded hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'}
      >
        <form className="space-y-4">
          <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
            <span className="text-sm font-medium text-gray-700">Enable Banner</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
              <input type="text" defaultValue={selectedBanner?.title || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="E.g., Summer Sale" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
              <select defaultValue={selectedBanner?.placement || 'Home Top'} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Home Top</option>
                <option>Home Middle</option>
                <option>Category Top</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Product</option>
                <option>Category</option>
                <option>Promotional Page</option>
                <option>External URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target (ID or URL)</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="/collections/summer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Start</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule End</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Banner</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
