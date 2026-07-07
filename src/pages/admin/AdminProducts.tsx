import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';

const mockAdminProducts = Array.from({ length: 32 }, (_, i) => ({
  id: `${i + 1}`,
  name: ['Classic White Tee', 'Black Denim Jacket', 'Vintage Wash Jeans', 'Leather Crossbody Bag', 'Oversized Hoodie'][i % 5] + (i >= 5 ? ` ${i + 1}` : ''),
  category: ['Clothing', 'Outerwear', 'Pants', 'Accessories', 'Clothing'][i % 5],
  price: 999 + (i * 100),
  status: i % 6 === 0 ? 'Inactive' : 'Active',
  image: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=150',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150'
  ][i % 5]
}));

export const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const openModal = (mode: 'add' | 'edit', product: any = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = mockAdminProducts.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <PageWrapper 
        title="Products" 
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add Product</span>
          </button>
        }
      >
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-black border border-gray-200 px-3 py-2 rounded-lg text-sm">
            <Filter size={16} />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium px-4">Product</th>
                <th className="pb-3 font-medium px-4">Category</th>
                <th className="pb-3 font-medium px-4">Price</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentProducts.length > 0 ? (
                currentProducts.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover border border-gray-200" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.category}</td>
                    <td className="py-4 px-4 font-medium">Rs. {product.price.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal('edit', product)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length > 0 && (
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" defaultValue={selectedProduct?.name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="E.g., Classic White Tee" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Clothing</option>
                <option>Outerwear</option>
                <option>Accessories</option>
                <option>Pants</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>T-Shirts</option>
                <option>Jeans</option>
                <option>Jackets</option>
                <option>Bags</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (Rs.)</label>
              <input type="number" defaultValue={selectedProduct?.mrp || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="1299" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Rs.)</label>
              <input type="number" defaultValue={selectedProduct?.price || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" defaultValue={selectedProduct?.image || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="https://..." />
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-bold mb-3 uppercase">Variants & Inventory</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
                  <input type="text" placeholder="E.g., Black" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color Images (Comma separated URLs)</label>
                  <input type="text" placeholder="URL1, URL2" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black" />
                </div>
              </div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Size Inventory</label>
              <div className="grid grid-cols-4 gap-2">
                <input type="number" placeholder="Size 28 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                <input type="number" placeholder="Size 30 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                <input type="number" placeholder="Size 32 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                <input type="number" placeholder="Size 34 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
              </div>
              <button type="button" className="mt-3 text-xs text-[#e35a39] font-medium hover:underline flex items-center">
                <Plus size={12} className="mr-1" /> Add Another Color Variant
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Product</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
