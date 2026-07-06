import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';

export const AdminSettings = () => (
  <PageWrapper title="Settings">
    <div className="max-w-2xl">
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input type="text" defaultValue="Oxbo Fashion" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
          <input type="email" defaultValue="support@oxbo.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
          <input type="text" defaultValue="Rs." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black" />
        </div>
        <div className="pt-4 border-t border-gray-200">
          <button type="button" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  </PageWrapper>
);
