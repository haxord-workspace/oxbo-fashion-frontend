import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

const mockAdminCategories = [
  { id: '1', name: 'Clothing', count: 124, status: 'Active' },
  { id: '2', name: 'Outerwear', count: 45, status: 'Active' },
  { id: '3', name: 'Pants', count: 89, status: 'Active' },
  { id: '4', name: 'Accessories', count: 210, status: 'Active' },
  { id: '5', name: 'Footwear', count: 32, status: 'Inactive' },
];

export const AdminCategories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const openModal = (mode: 'add' | 'edit', category: any = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageWrapper 
        title="Categories"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add Category</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium px-4">Category Name</th>
                <th className="pb-3 font-medium px-4">Products</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mockAdminCategories.map(cat => (
                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{cat.name}</td>
                  <td className="py-4 px-4 text-gray-600">{cat.count} items</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal('edit', cat)}
                        className="p-1.5 text-gray-400 hover:text-black transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" defaultValue={selectedCategory?.name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="E.g., Summer Collection" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Category</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
