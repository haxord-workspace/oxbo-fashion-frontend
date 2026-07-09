import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminBrandApi } from '../../services/admin/adminBrand.Api';
import type { Brand } from '../../types';

export const AdminBrands = () => {
  // Data States
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalBrands, setTotalBrands] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Form States
  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await adminBrandApi.getBrands(params);
      setBrands(data.brands);
      setTotalBrands(data.total);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch brands');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const openModal = (mode: 'add' | 'edit' | 'delete', brand: Brand | null = null) => {
    setModalMode(mode);
    setSelectedBrand(brand);
    setLogoFile(null);
    setLogoPreview(null);
    
    if (mode === 'edit' && brand) {
      setBrandForm({
        name: brand.name || '',
        description: brand.description || '',
        isActive: brand.isActive !== false,
      });
      if (brand.logo) {
        setLogoPreview(brand.logo);
      }
    } else {
      setBrandForm({
        name: '',
        description: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', brandForm.name);
      formData.append('description', brandForm.description);
      formData.append('isActive', String(brandForm.isActive));
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (modalMode === 'add') {
        const response = await adminBrandApi.createBrand(formData);
        toast.success(response.message || 'Brand created successfully');
        if (response.brand) {
          setBrands([response.brand, ...brands]);
          setTotalBrands(prev => prev + 1);
        } else {
          fetchBrands();
        }
      } else if (modalMode === 'edit' && selectedBrand) {
        const brandId = selectedBrand._id || selectedBrand.id || '';
        const response = await adminBrandApi.updateBrand(brandId, formData);
        
        // Handle status changes if supported by specific endpoints
        if (brandForm.isActive !== selectedBrand.isActive) {
          try {
            await adminBrandApi.updateBrandStatus(brandId, brandForm.isActive);
          } catch (statusErr: any) {
             toast.error('Brand details updated, but failed to change status');
          }
        }
        
        toast.success(response.message || 'Brand updated successfully');
        setBrands(brands.map(b => (b._id || b.id) === brandId ? { ...b, ...brandForm, logo: logoPreview || b.logo } : b));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || `Failed to ${modalMode} brand`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    const brandId = selectedBrand._id || selectedBrand.id || '';
    
    setIsSubmitting(true);
    try {
      const response = await adminBrandApi.deleteBrand(brandId);
      toast.success(response.message || 'Brand deleted successfully');
      setBrands(brands.filter(b => (b._id || b.id) !== brandId));
      setTotalBrands(prev => prev - 1);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (brand: Brand) => {
    const brandId = brand._id || brand.id || '';
    const newStatus = brand.isActive === false ? true : false;
    
    // Optimistic update
    setBrands(brands.map(b => (b._id || b.id) === brandId ? { ...b, isActive: newStatus } : b));
    
    try {
      await adminBrandApi.updateBrandStatus(brandId, newStatus);
      toast.success(`Brand ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update brand status');
      // Revert optimistic update
      setBrands(brands.map(b => (b._id || b.id) === brandId ? { ...b, isActive: !newStatus } : b));
    }
  };

  const totalPages = Math.ceil(totalBrands / itemsPerPage);

  return (
    <>
      <PageWrapper 
        title="Brands"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add Brand</span>
          </button>
        }
      >
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search brands..." 
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
                <th className="pb-3 font-medium px-4">Logo</th>
                <th className="pb-3 font-medium px-4">Brand Name</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading brands...
                    </div>
                  </td>
                </tr>
              ) : brands.length > 0 ? (
                brands.map(brand => (
                  <tr 
                    key={brand._id || brand.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-cover rounded-md bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      <div className="text-base">{brand.name}</div>
                      {brand.description && <div className="text-xs text-gray-500 font-normal truncate max-w-[250px] mt-1.5">{brand.description}</div>}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(brand); }}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-1 ${brand.isActive !== false ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${brand.isActive !== false ? 'translate-x-4' : 'translate-x-1'}`}
                            style={{ transform: brand.isActive !== false ? 'translateX(18px)' : 'translateX(3px)' }}
                          />
                        </button>
                        <span className={`text-xs font-medium ${brand.isActive !== false ? 'text-green-600' : 'text-gray-500'}`}>
                          {brand.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openModal('edit', brand); }}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openModal('delete', brand); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
                    No brands found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalBrands > 0 && (
          <div className="mt-6">
            <AdminPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalBrands}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Brand' : modalMode === 'edit' ? 'Edit Brand' : 'Delete Brand'}
      >
        {modalMode === 'delete' ? (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedBrand?.name}</span>?
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
                onClick={handleDeleteBrand}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Brand'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBrandSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Logo</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
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
                    onChange={handleLogoChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:transition-colors cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Recommended size: 400x400px · Max 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Name</label>
              <input
                type="text"
                value={brandForm.name}
                onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-shadow"
                placeholder="E.g., Nike"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={brandForm.description}
                onChange={e => setBrandForm({ ...brandForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black min-h-[80px] resize-none transition-shadow"
                placeholder="Brief description of this brand..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={brandForm.isActive ? 'active' : 'inactive'}
                onChange={e => setBrandForm({ ...brandForm, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black bg-white transition-shadow"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 min-w-[130px] justify-center"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Brand'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </>
  );
};
