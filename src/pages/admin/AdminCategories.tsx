import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIsStoreManager } from '../../features/auth/authSlice';
import { Plus, Edit2, Trash2, Search, Loader2, Image as ImageIcon, Filter, Package, FolderTree, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminCategoriesApi } from '../../services/admin/admincategories.Api';
import { adminProductApi } from '../../services/admin/adminProduct.Api';
import { ImageCropper } from '../../components/common/ImageCropper';
import type { Category } from '../../types';

interface FormErrors {
  name?: string;
}

export const AdminCategories = () => {
  const isStoreManager = useAppSelector(selectIsStoreManager);
  
  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // View Mode States
  const [viewMode, setViewMode] = useState<'main' | 'subcategories' | 'products'>('main');
  const [subcategoryHistory, setSubcategoryHistory] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [categoryForProducts, setCategoryForProducts] = useState<any>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);

  // Empty State Modal
  const [isEmptyModalOpen, setIsEmptyModalOpen] = useState(false);
  const [emptyModalContent, setEmptyModalContent] = useState('');

  // Form States
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
    parentCategory: string;
    suggestions: { title: string; description: string }[];
  }>({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
    parentCategory: '',
    suggestions: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }
      const data = await adminCategoriesApi.getCategories(params);
      setCategories(data.categories);
      setTotalCategories(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter]);

  const fetchCategoryTree = useCallback(async () => {
    try {
      const data = await adminCategoriesApi.getCategoryTree();
      setCategoryTree(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch category tree:', err);
    }
  }, []);

  const handleViewSubcategories = async (category: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const data = await adminCategoriesApi.getCategoryChildren(category._id || category.id);
      if (!data.categories || data.categories.length === 0) {
         setEmptyModalContent(`No subcategories found for ${category.name}`);
         setIsEmptyModalOpen(true);
      } else {
         setSubcategories(data.categories);
         setSubcategoryHistory([category]);
         setViewMode('subcategories');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNestedSubcategories = async (category: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const data = await adminCategoriesApi.getCategoryChildren(category._id || category.id);
      if (!data.categories || data.categories.length === 0) {
         setEmptyModalContent(`No subcategories found for ${category.name}`);
         setIsEmptyModalOpen(true);
      } else {
         setSubcategories(data.categories);
         setSubcategoryHistory(prev => [...prev, category]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    if (viewMode === 'products') {
      setViewMode(subcategoryHistory.length > 0 ? 'subcategories' : 'main');
    } else if (viewMode === 'subcategories') {
      const newHistory = [...subcategoryHistory];
      newHistory.pop();
      if (newHistory.length === 0) {
        setViewMode('main');
        setSubcategoryHistory([]);
      } else {
        setSubcategoryHistory(newHistory);
        const prevCategory = newHistory[newHistory.length - 1];
        setIsLoading(true);
        try {
          const data = await adminCategoriesApi.getCategoryChildren(prevCategory._id || prevCategory.id);
          setSubcategories(data.categories || []);
        } catch (err: any) {
          toast.error(err.message || 'Failed to fetch subcategories');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleViewProducts = async (category: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const data = await adminProductApi.getProducts({ category: category._id || category.id });
      if (!data.products || data.products.length === 0) {
         setEmptyModalContent(`No products found in ${category.name}`);
         setIsEmptyModalOpen(true);
      } else {
         setCategoryProducts(data.products);
         setCategoryForProducts(category);
         setViewMode('products');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCategoryTree();
  }, [fetchCategories, fetchCategoryTree]);

  // Reset to first page when searching or filtering
  const openModal = (mode: 'add' | 'edit' | 'delete', category: any = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    setImageFile(null);
    setImagePreview(null);
    
    if (mode === 'edit' && category) {
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== false,
        sortOrder: category.sortOrder || 0,
        parentCategory: typeof category.parentCategory === 'object' ? category.parentCategory?._id || category.parentCategory?.id || '' : category.parentCategory || '',
        suggestions: category.suggestions || []
      });
      if (category.image) {
        setImagePreview(category.image);
      }
    } else {
      setCategoryForm({
        name: '',
        description: '',
        isActive: true,
        sortOrder: 0,
        parentCategory: '',
        suggestions: []
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!categoryForm.name.trim()) newErrors.name = 'Category name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImageSrc(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      formData.append('isActive', String(categoryForm.isActive));
      formData.append('sortOrder', String(categoryForm.sortOrder));
      if (categoryForm.parentCategory) {
        formData.append('parentCategory', categoryForm.parentCategory);
      }
      if (categoryForm.suggestions && categoryForm.suggestions.length > 0) {
        formData.append('suggestions', JSON.stringify(categoryForm.suggestions));
      } else {
        formData.append('suggestions', JSON.stringify([]));
      }
      
      if (imageFile) {
        formData.append('image', imageFile); // Or 'photo' depending on backend
      }

      if (modalMode === 'add') {
        const response = await adminCategoriesApi.createCategory(formData);
        toast.success(response.message || 'Category created successfully');
        fetchCategories(); // Always fetch to maintain correct pagination size
      } else if (modalMode === 'edit' && selectedCategory) {
        const categoryId = selectedCategory._id || selectedCategory.id || '';
        const response = await adminCategoriesApi.updateCategory(categoryId, formData);
        
        // Handle status changes using specific endpoints if they changed
        if (categoryForm.isActive !== selectedCategory.isActive) {
          try {
            if (categoryForm.isActive) {
              await adminCategoriesApi.activateCategory(categoryId);
            } else {
              await adminCategoriesApi.deactivateCategory(categoryId);
            }
          } catch (statusErr: any) {
             toast.error('Category details updated, but failed to change status');
          }
        }
        
        toast.success(response.message || 'Category updated successfully');
        setCategories(categories.map(c => (c._id || c.id) === categoryId ? { ...c, ...categoryForm, image: imagePreview || c.image } : c));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || `Failed to ${modalMode} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    const categoryId = selectedCategory._id || selectedCategory.id || '';
    
    setIsSubmitting(true);
    try {
      const response = await adminCategoriesApi.deleteCategory(categoryId);
      toast.success(response.message || 'Category deleted successfully');
      fetchCategories(); // Re-fetch to get correct page sizing
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryOptions = (cats: any[], depth = 0): React.ReactNode => {
    return cats.map(cat => {
      if (selectedCategory && (cat._id || cat.id) === (selectedCategory._id || selectedCategory.id)) return null;
      
      return (
        <React.Fragment key={cat._id || cat.id}>
          <option value={cat._id || cat.id}>
            {'\u00A0\u00A0'.repeat(depth * 2)}{depth > 0 ? '— ' : ''}{cat.name}
          </option>
          {cat.children && cat.children.length > 0 && renderCategoryOptions(cat.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const totalPages = Math.ceil(totalCategories / itemsPerPage);

  return (
    <>
      <PageWrapper 
        title={
          <div className="flex items-center gap-3">
            {viewMode !== 'main' && (
              <button onClick={handleBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center border border-gray-200">
                <ArrowLeft size={18} className="text-gray-700" />
              </button>
            )}
            <span>
              {viewMode === 'main' ? 'Categories' 
               : viewMode === 'subcategories' ? `${subcategoryHistory[subcategoryHistory.length - 1]?.name} - Subcategories` 
               : `Products in ${categoryForProducts?.name}`}
            </span>
          </div>
        }
        headerAction={
          viewMode === 'main' && (
            <button 
              onClick={() => openModal('add')}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add Category</span>
            </button>
          )
        }
      >
        {viewMode === 'main' && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-colors text-sm"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-colors text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {viewMode === 'products' ? (
                <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium px-4">Image</th>
                  <th className="pb-3 font-medium px-4">Product Name</th>
                  <th className="pb-3 font-medium px-4 text-center">Price</th>
                  <th className="pb-3 font-medium px-4 text-center">Stock</th>
                  <th className="pb-3 font-medium px-4 text-right">Status</th>
                </tr>
              ) : (
                <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium px-4">Image</th>
                  <th className="pb-3 font-medium px-4">Category Name</th>
                  <th className="pb-3 font-medium px-4 text-center">Total Subcategories</th>
                  <th className="pb-3 font-medium px-4 text-center">Total Products</th>
                  <th className="pb-3 font-medium px-4">Sort Order</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : viewMode === 'products' ? (
                categoryProducts.length > 0 ? (
                  categoryProducts.map(prod => (
                    <tr key={prod._id || prod.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        {prod.images && prod.images.length > 0 ? (
                          <img src={prod.images[0].url || prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-md bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        <div className="text-base truncate max-w-[300px]">{prod.name}</div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 font-medium">
                        ${prod.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 font-medium">
                        {prod.stock !== undefined ? prod.stock : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${prod.status === 'active' || prod.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {prod.status || (prod.isActive !== false ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                      No products found
                    </td>
                  </tr>
                )
              ) : (
                (viewMode === 'main' ? categories : subcategories).length > 0 ? (
                  (viewMode === 'main' ? categories : subcategories).map(cat => (
                    <tr 
                      key={cat._id || cat.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-md bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        <div className="text-base">{cat.name}</div>
                        <div className="mt-1.5">
                          {cat.parentCategory ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              Subcategory
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Main Category
                            </span>
                          )}
                        </div>
                        {cat.description && <div className="text-xs text-gray-500 font-normal truncate max-w-[250px] mt-1.5">{cat.description}</div>}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 font-medium">{cat.subCategoryCount !== undefined ? cat.subCategoryCount : (cat.totalSubCategories || 0)}</td>
                      <td className="py-4 px-4 text-center text-gray-600 font-medium">{cat.productCount !== undefined ? cat.productCount : (cat.totalProducts || 0)}</td>
                      <td className="py-4 px-4 text-gray-600">{cat.sortOrder || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cat.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => handleViewProducts(cat, e)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" 
                            title="View Products"
                          >
                            <Package size={16} />
                          </button>
                          <button 
                            onClick={(e) => viewMode === 'main' ? handleViewSubcategories(cat, e) : handleViewNestedSubcategories(cat, e)}
                            className="p-1.5 text-gray-400 hover:text-purple-500 transition-colors" 
                            title="View Subcategories"
                          >
                            <FolderTree size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); openModal('edit', cat); }}
                            className="p-1.5 text-gray-400 hover:text-primary transition-colors" 
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {!isStoreManager && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openModal('delete', cat); }}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" 
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                      No categories found
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        
        {viewMode === 'main' && totalCategories > 0 && (
          <div className="mt-6">
            <AdminPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalCategories}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </PageWrapper>

    <AdminModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={modalMode === 'add' ? 'Add New Category' : modalMode === 'edit' ? 'Edit Category' : 'Delete Category'}
    >
      {modalMode === 'delete' ? (
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedCategory?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteCategory}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Category'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCategorySubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-md bg-gray-100 border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                  <ImageIcon size={22} />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:transition-colors cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1.5">Recommended size: 800x800px · Max 2MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={e => {
                  setCategoryForm({ ...categoryForm, name: e.target.value });
                  if (errors.name) setErrors({...errors, name: undefined});
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/10 transition-shadow ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'}`}
                placeholder="E.g., Summer Collection"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
              <select
                value={categoryForm.parentCategory}
                onChange={e => setCategoryForm({ ...categoryForm, parentCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white transition-shadow"
              >
                <option value="">None (Root Category)</option>
                {categoryTree.length > 0
                  ? renderCategoryOptions(categoryTree)
                  : categories
                      .filter(c => (c._id || c.id) !== (selectedCategory?._id || selectedCategory?.id))
                      .map(c => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                      ))
                }
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary min-h-[80px] resize-none transition-shadow"
              placeholder="Brief description of this category..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
              <input
                type="number"
                value={categoryForm.sortOrder}
                onChange={e => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={categoryForm.isActive ? 'active' : 'inactive'}
                onChange={e => setCategoryForm({ ...categoryForm, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white transition-shadow"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Suggestions</label>
              <button
                type="button"
                onClick={() => setCategoryForm({ ...categoryForm, suggestions: [...categoryForm.suggestions, { title: '', description: '' }] })}
                className="text-xs flex items-center gap-1 text-primary font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              >
                <Plus size={14} /> Add Suggestion
              </button>
            </div>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {categoryForm.suggestions.map((suggestion, index) => (
                <div key={index} className="flex gap-2 items-start border border-gray-100 bg-gray-50 p-2 rounded">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={suggestion.title}
                      onChange={e => {
                        const newSuggestions = [...categoryForm.suggestions];
                        newSuggestions[index].title = e.target.value;
                        setCategoryForm({ ...categoryForm, suggestions: newSuggestions });
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Suggestion Title"
                    />
                    <input
                      type="text"
                      value={suggestion.description}
                      onChange={e => {
                        const newSuggestions = [...categoryForm.suggestions];
                        newSuggestions[index].description = e.target.value;
                        setCategoryForm({ ...categoryForm, suggestions: newSuggestions });
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Suggestion Description"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSuggestions = [...categoryForm.suggestions];
                      newSuggestions.splice(index, 1);
                      setCategoryForm({ ...categoryForm, suggestions: newSuggestions });
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {categoryForm.suggestions.length === 0 && (
                <p className="text-sm text-gray-500 italic">No suggestions added yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 min-w-[130px] justify-center"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
            </button>
          </div>
        </form>
      )}
    </AdminModal>
      
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={(croppedFile) => {
            setImageFile(croppedFile);
            setImagePreview(URL.createObjectURL(croppedFile));
            setCropImageSrc(null);
          }}
          onCancel={() => setCropImageSrc(null)}
          aspectRatio={1}
        />
      )}

      <AdminModal
        isOpen={isEmptyModalOpen}
        onClose={() => setIsEmptyModalOpen(false)}
        title="Notice"
        maxWidth="max-w-md"
      >
        <div className="py-6 text-center text-gray-600">
           {emptyModalContent}
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
           <button 
             onClick={() => setIsEmptyModalOpen(false)}
             className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors"
           >
             Close
           </button>
        </div>
      </AdminModal>
    </>
  );
};
