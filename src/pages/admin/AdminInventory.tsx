import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

const mockInventory = [
  { sku: 'TSH-WHT-M', name: 'Classic White Tee - M', stock: 120, status: 'In Stock' },
  { sku: 'JAC-BLK-L', name: 'Black Denim Jacket - L', stock: 15, status: 'Low Stock' },
  { sku: 'PNT-VIN-32', name: 'Vintage Wash Jeans - 32', stock: 0, status: 'Out of Stock' },
];

export const AdminInventory = () => (
  <PageWrapper title="Inventory">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
            <th className="pb-3 font-medium px-4">SKU</th>
            <th className="pb-3 font-medium px-4">Product Name</th>
            <th className="pb-3 font-medium px-4">Stock Level</th>
            <th className="pb-3 font-medium px-4">Status</th>
            <th className="pb-3 font-medium px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {mockInventory.map(item => (
            <tr key={item.sku} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4 font-mono text-xs text-gray-600">{item.sku}</td>
              <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
              <td className="py-4 px-4 font-medium">{item.stock} units</td>
              <td className="py-4 px-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                  ${item.status === 'In Stock' ? 'bg-green-100 text-green-700' : 
                    item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-700'}`}
                >
                  {item.status}
                </span>
              </td>
              <td className="py-4 px-4 text-right">
                <button className="text-[#e35a39] hover:text-black font-medium text-sm transition-colors">Update Stock</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </PageWrapper>
);
