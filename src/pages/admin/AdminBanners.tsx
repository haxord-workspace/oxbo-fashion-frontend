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
    position: 'Home-Top',
    image: '',
    isActive: true,
    redirectUrl: '',
    sortOrder: 1
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
        position: banner.position || 'Home-Top',
        image: banner.image || '',
        isActive: banner.isActive !== false,
        redirectUrl: banner.redirectUrl || '',
        sortOrder: banner.sortOrder || 1
      });
      setImageFiles([]);
    } else {
      setBannerForm({
        title: '',
        position: 'Home-Top',
        image: '',
        isActive: true,
        redirectUrl: '',
        sortOrder: 1
      });
      setImageFiles([]);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!bannerForm.title?.trim()) newErrors.title = 'Banner title is required';
    if (imageFiles.length === 0 && !bannerForm.image) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (modalMode === 'add' && bannerForm.position === 'Carousel' && imageFiles.length > 1) {
        const promises = imageFiles.map(file => {
          const formData = new FormData();
          if (bannerForm.title) formData.append('title', bannerForm.title);
          formData.append('image', file);
          if (bannerForm.redirectUrl) formData.append('redirectUrl', bannerForm.redirectUrl);
          formData.append('isActive', String(bannerForm.isActive));
          if (bannerForm.sortOrder) formData.append('sortOrder', String(bannerForm.sortOrder));
          formData.append('position', bannerForm.position || 'Carousel');
          return adminBannerApi.createBanner(formData);
        });
        await Promise.all(promises);
        toast.success(`${imageFiles.length} banners created successfully`);
      } else {
        const formData = new FormData();
        if (bannerForm.title) formData.append('title', bannerForm.title);
        if (imageFiles.length > 0) {
          formData.append('image', imageFiles[0]);
        } else if (bannerForm.image && typeof bannerForm.image === 'string') {
          formData.append('image', bannerForm.image);
        }
        if (bannerForm.redirectUrl) formData.append('redirectUrl', bannerForm.redirectUrl);
        formData.append('isActive', String(bannerForm.isActive));
        if (bannerForm.sortOrder) formData.append('sortOrder', String(bannerForm.sortOrder));
        if (bannerForm.position) formData.append('position', bannerForm.position || 'Home-Top');

        if (modalMode === 'add') {
          await adminBannerApi.createBanner(formData);
          toast.success('Banner created successfully');
        } else if (modalMode === 'edit' && selectedBanner) {
          await adminBannerApi.updateBanner(selectedBanner._id || selectedBanner.id || '', formData);
          toast.success('Banner updated successfully');
        }
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
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
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
                    className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors"
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
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="E.g., Summer Sale" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select value={bannerForm.position} onChange={e => {
                const newPos = e.target.value;
                setBannerForm({...bannerForm, position: newPos});
                if (newPos !== 'Carousel' && imageFiles.length > 1) {
                  setImageFiles([imageFiles[0]]);
                }
              }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="Home-Top">Home Top</option>
                <option value="Home-Middle">Home Middle</option>
                <option value="Category Top">Category Top</option>
                <option value="Carousel">Carousel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image File{bannerForm.position === 'Carousel' ? 's' : ''}</label>
            <input type="file" accept="image/*" multiple={bannerForm.position === 'Carousel'} onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                if (bannerForm.position === 'Carousel') {
                  setImageFiles(Array.from(e.target.files));
                } else {
                  setImageFiles([e.target.files[0]]);
                }
                if (errors.image) setErrors({...errors, image: undefined});
              }
            }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.image ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
            
            <div className="flex flex-wrap gap-2 mt-2">
              {imageFiles.length > 0 ? (
                imageFiles.map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="h-20 object-cover rounded" />
                ))
              ) : bannerForm.image && typeof bannerForm.image === 'string' ? (
                <img src={bannerForm.image} alt="Preview" className="h-20 object-cover rounded" />
              ) : null}
            </div>
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
              <input type="text" value={bannerForm.redirectUrl} onChange={e => setBannerForm({...bannerForm, redirectUrl: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input type="number" min="1" value={bannerForm.sortOrder} onChange={e => setBannerForm({...bannerForm, sortOrder: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Banner'}
            </button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
