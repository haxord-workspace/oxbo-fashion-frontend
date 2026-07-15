import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';

const STORES = ['All Stores', 'Downtown Store', 'Uptown Store', 'Mall Outlet'];

const mockInventory = Array.from({ length: 45 }, (_, i) => ({
  sku: `ITEM-${1000 + i}`,
  name: `Product Variant ${i + 1}`,
  stock: Math.floor(Math.random() * 150),
  status: i % 8 === 0 ? 'Out of Stock' : i % 5 === 0 ? 'Low Stock' : 'In Stock',
  store: STORES[(i % 3) + 1]
}));

export const AdminInventory = () => {
  const [selectedStore, setSelectedStore] = useState('All Stores');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredInventory = mockInventory.filter(item => 
    selectedStore === 'All Stores' || item.store === selectedStore
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  
  const currentInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStore]);

  return (
    <PageWrapper title="Inventory">
      <div className="mb-6 flex gap-4">
        <div className="relative">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e35a39]/20 focus:border-[#e35a39] transition-all cursor-pointer"
          >
            {STORES.map(store => (
              <option key={store} value={store}>{store}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Filter className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="pb-3 font-medium px-4">SKU</th>
              <th className="pb-3 font-medium px-4">Product Name</th>
              <th className="pb-3 font-medium px-4">Store</th>
              <th className="pb-3 font-medium px-4">Stock Level</th>
              <th className="pb-3 font-medium px-4">Status</th>
              <th className="pb-3 font-medium px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentInventory.length > 0 ? (
              currentInventory.map(item => (
                <tr key={item.sku} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-gray-600">{item.sku}</td>
                  <td className="py-4 px-4 font-medium text-gray-900">{item.name}</td>
                  <td className="py-4 px-4 text-gray-600">{item.store}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredInventory.length > 0 && (
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredInventory.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </PageWrapper>
  );
};
