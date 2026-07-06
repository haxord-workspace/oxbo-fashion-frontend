import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

const mockAdminOrders = [
  { id: 'ORD-7829', customer: 'John Doe', email: 'john@example.com', date: '2026-07-06', total: 3498, status: 'Processing' },
  { id: 'ORD-7828', customer: 'Jane Smith', email: 'jane.s@example.com', date: '2026-07-05', total: 1299, status: 'Shipped' },
  { id: 'ORD-7827', customer: 'Michael Brown', email: 'mikeb@example.com', date: '2026-07-04', total: 5497, status: 'Delivered' },
  { id: 'ORD-7826', customer: 'Emily Davis', email: 'emily.d@example.com', date: '2026-07-04', total: 999, status: 'Pending' },
  { id: 'ORD-7825', customer: 'Chris Wilson', email: 'chrisw@example.com', date: '2026-07-03', total: 2499, status: 'Cancelled' },
];

const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];

export const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredOrders = mockAdminOrders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
              <th className="pb-3 font-medium px-4">Order ID</th>
              <th className="pb-3 font-medium px-4">Customer</th>
              <th className="pb-3 font-medium px-4">Date</th>
              <th className="pb-3 font-medium px-4">Total</th>
              <th className="pb-3 font-medium px-4">Status</th>
              <th className="pb-3 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No orders found matching your filters.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.email}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-medium">Rs. {order.total.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        ['Processing', 'Confirmed', 'Packed'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                        ['Shipped', 'Out for Delivery'].includes(order.status) ? 'bg-purple-100 text-purple-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-200 bg-gray-100 rounded-md transition-colors">
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
    </PageWrapper>
  );
};
