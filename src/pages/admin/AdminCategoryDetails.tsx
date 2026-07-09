import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ArrowLeft, Loader2 } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminCategoriesApi } from '../../services/admin/admincategories.Api';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

// Mock data specific to a category
const mockCategoryProducts = Array.from({ length: 24 }, (_, i) => ({
  id: `${i + 1}`,
  name: ['Baggy Pant', 'Formal Pant', 'Cargo Pant', 'Slim Fit Pant'][i % 4] + (i >= 4 ? ` Variant ${i + 1}` : ''),
  price: 1000 + Math.floor(Math.random() * 2000),
  stock: Math.floor(Math.random() * 250),
  status: i % 5 === 0 ? 'Out of Stock' : i % 3 === 0 ? 'Low Stock' : 'In Stock',
  image: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150',
    'https://images.unsplash.com/photo-1594938298596-eb5fd3e16666?w=150',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=150',
    'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=150'
  ][i % 4]
}));

export const AdminCategoryDetails = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      setIsLoadingCategory(true);
      try {
        const response = await adminCategoriesApi.getCategoryById(categoryId);
        setCategory(response.category);
      } catch (err: any) {
        toast.error('Failed to load category details');
      } finally {
        setIsLoadingCategory(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  const categoryName = category?.name || `Category ${categoryId}`;

  const openModal = (mode: 'add' | 'edit', product: any = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = mockCategoryProducts.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <>
      <PageWrapper 
        title={isLoadingCategory ? (
          <div className="flex items-center text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading Category...
          </div>
        ) : (
          `${categoryName} Products`
        )}
        headerAction={
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/admin/categories')}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <button 
              onClick={() => openModal('add')}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add Product</span>
            </button>
          </div>
        }
      >
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium px-4">Product</th>
                <th className="pb-3 font-medium px-4">Price</th>
                <th className="pb-3 font-medium px-4">Stock</th>
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
                    <td className="py-4 px-4 font-medium">Rs. {product.price.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-gray-600">{product.stock} units</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                        ${product.status === 'In Stock' ? 'bg-green-100 text-green-700' : 
                          product.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-700'}`}
                      >
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
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No products found in this category
                  </td>
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
            <input type="text" defaultValue={selectedProduct?.name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="E.g., Cargo Pant" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
              <input type="number" defaultValue={selectedProduct?.price || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="1999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" defaultValue={selectedProduct?.stock || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Product</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
