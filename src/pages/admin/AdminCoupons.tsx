import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

export const AdminCoupons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const openModal = (mode: 'add' | 'edit', coupon: any = null) => {
    setModalMode(mode);
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  return (
    <>
      <PageWrapper 
        title="Coupons"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Create Coupon</span>
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium px-4">Code</th>
                <th className="pb-3 font-medium px-4">Discount</th>
                <th className="pb-3 font-medium px-4">Expiry</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-mono font-medium text-black">WELCOME20</td>
                <td className="py-4 px-4 text-green-600 font-medium">20% OFF</td>
                <td className="py-4 px-4 text-gray-600">Dec 31, 2026</td>
                <td className="py-4 px-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span></td>
                <td className="py-4 px-4 text-right">
                  <button onClick={() => openModal('edit', { code: 'WELCOME20', discount: 20 })} className="p-1.5 text-gray-400 hover:text-black"><Edit2 size={16} /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Create Coupon' : 'Edit Coupon'}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input type="text" defaultValue={selectedCoupon?.code || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black uppercase" placeholder="E.g., SUMMER50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Percentage (%)</option>
                <option>Fixed Amount (Rs.)</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input type="number" defaultValue={selectedCoupon?.discount || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (Rs.)</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (Rs.)</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (per coupon)</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Specific</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center text-sm text-gray-600">
                <input type="radio" name="customerType" className="mr-2 accent-black" defaultChecked /> All Customers
              </label>
              <label className="flex items-center text-sm text-gray-600">
                <input type="radio" name="customerType" className="mr-2 accent-black" /> Specific User (Email)
              </label>
            </div>
            <input type="email" placeholder="Customer Email (if specific)" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black hidden" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Coupon</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
