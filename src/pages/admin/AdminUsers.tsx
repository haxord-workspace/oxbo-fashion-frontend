import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

const mockAdminUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'Active', joined: '2026-01-15' },
  { id: '2', name: 'Admin Account', email: 'admin@oxbo.com', role: 'admin', status: 'Active', joined: '2025-12-01' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'Inactive', joined: '2026-03-22' },
];

export const AdminUsers = () => (
  <PageWrapper title="Users">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
            <th className="pb-3 font-medium px-4">User</th>
            <th className="pb-3 font-medium px-4">Role</th>
            <th className="pb-3 font-medium px-4">Status</th>
            <th className="pb-3 font-medium px-4">Joined Date</th>
            <th className="pb-3 font-medium px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {mockAdminUsers.map(user => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </td>
              <td className="py-4 px-4 capitalize text-gray-600">{user.role}</td>
              <td className="py-4 px-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {user.status}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-600">{new Date(user.joined).toLocaleDateString()}</td>
              <td className="py-4 px-4">
                <div className="flex justify-end gap-2">
                  <button className="p-1.5 text-gray-400 hover:text-black transition-colors" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Block">
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
);
