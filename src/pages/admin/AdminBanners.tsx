import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminBannerApi, type Banner } from '../../services/admin/adminBanner.Api';
import toast from 'react-hot-toast';

interface FormErrors {
  title?: string;
  image?: string;
}

export const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    position: 'home_top',
    image: '',
    isActive: true,
    redirectUrl: '',
    sortOrder: 1
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalBanners, setTotalBanners] = useState(0);

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminBannerApi.getBanners({ page: currentPage, limit: itemsPerPage });
      setBanners(response.data?.data || response.data || []);
      setTotalBanners(response.data?.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const totalPages = Math.ceil(totalBanners / itemsPerPage) || 1;

  const openModal = (mode: 'add' | 'edit', banner: Banner | null = null) => {
    setModalMode(mode);
    setSelectedBanner(banner);
    if (mode === 'edit' && banner) {
      setBannerForm({
        title: banner.title || '',
        position: banner.position || 'home_top',
        image: banner.image || '',
        isActive: banner.isActive !== false,
        redirectUrl: banner.redirectUrl || '',
        sortOrder: banner.sortOrder || 1
      });
      setImageFile(null);
    } else {
      setBannerForm({
        title: '',
        position: 'home_top',
        image: '',
        isActive: true,
        redirectUrl: '',
        sortOrder: 1
      });
      setImageFile(null);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!bannerForm.title?.trim()) newErrors.title = 'Banner title is required';
    if (!imageFile && !bannerForm.image) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (bannerForm.title) formData.append('title', bannerForm.title);
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (bannerForm.image && typeof bannerForm.image === 'string') {
        formData.append('image', bannerForm.image);
      }
      if (bannerForm.redirectUrl) formData.append('redirectUrl', bannerForm.redirectUrl);
      formData.append('isActive', String(bannerForm.isActive));
      if (bannerForm.sortOrder) formData.append('sortOrder', String(bannerForm.sortOrder));
      if (bannerForm.position) formData.append('position', bannerForm.position);

      if (modalMode === 'add') {
        await adminBannerApi.createBanner(formData);
        toast.success('Banner created successfully');
      } else if (modalMode === 'edit' && selectedBanner) {
        await adminBannerApi.updateBanner(selectedBanner._id || selectedBanner.id || '', formData);
        toast.success('Banner updated successfully');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminBannerApi.updateBannerStatus(id, { isActive: !currentStatus });
      toast.success(`Banner ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update banner status');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    setIsDeleting(id);
    try {
      await adminBannerApi.deleteBanner(id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete banner');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <PageWrapper 
        title="Banners"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Add Banner</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center gap-2 text-gray-500 border border-gray-200 rounded-lg bg-white">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading banners...
            </div>
          ) : banners.length > 0 ? (
            banners.map((banner) => (
              <div key={banner._id || banner.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-16 bg-gray-200 rounded overflow-hidden">
                    <img src={banner.image as string} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{banner.title}</h4>
                    <p className="text-xs text-gray-500">Position: {banner.position} | Sort: {banner.sortOrder}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={banner.isActive !== false} 
                        onChange={() => handleToggleStatus(banner._id || banner.id || '', banner.isActive !== false)} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openModal('edit', banner)}
                    className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteBanner(banner._id || banner.id || '')}
                    disabled={isDeleting === (banner._id || banner.id)}
                    className="p-2 border border-gray-200 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {isDeleting === (banner._id || banner.id) ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 border border-gray-200 rounded-lg bg-white">
              No banners found.
            </div>
          )}
        </div>
        
        {totalBanners > 0 && (
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalBanners}
            itemsPerPage={itemsPerPage}
          />
        )}
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'}
      >
        <form className="space-y-4" onSubmit={handleBannerSubmit} noValidate>
        

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
              <input type="text" value={bannerForm.title} onChange={e => {
                setBannerForm({...bannerForm, title: e.target.value});
                if (errors.title) setErrors({...errors, title: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} placeholder="E.g., Summer Sale" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select value={bannerForm.position} onChange={e => setBannerForm({...bannerForm, position: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white">
                <option value="home_top">Home Top</option>
                <option value="home_middle">Home Middle</option>
                <option value="category_top">Category Top</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
            <input type="file" accept="image/*" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0]);
                if (errors.image) setErrors({...errors, image: undefined});
              }
            }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.image ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} />
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 h-20 object-cover" />
            ) : bannerForm.image && typeof bannerForm.image === 'string' ? (
              <img src={bannerForm.image} alt="Preview" className="mt-2 h-20 object-cover" />
            ) : null}
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
              <input type="text" value={bannerForm.redirectUrl} onChange={e => setBannerForm({...bannerForm, redirectUrl: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" min="1" value={bannerForm.sortOrder} onChange={e => setBannerForm({...bannerForm, sortOrder: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Banner'}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
