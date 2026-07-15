import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';

interface FormErrors {
  title?: string;
  image?: string;
}

const mockBanners = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Banner ${i + 1}`,
  placement: ['Home Top', 'Home Middle', 'Category Top'][i % 3],
  image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300'
}));

export const AdminBanners = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  
  const [bannerForm, setBannerForm] = useState({
    title: '',
    placement: 'Home Top',
    image: '',
    enabled: true
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(mockBanners.length / itemsPerPage);
  
  const currentBanners = mockBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (mode: 'add' | 'edit', banner: any = null) => {
    setModalMode(mode);
    setSelectedBanner(banner);
    if (mode === 'edit' && banner) {
      setBannerForm({
        title: banner.title || '',
        placement: banner.placement || 'Home Top',
        image: banner.image || '',
        enabled: banner.enabled !== false
      });
    } else {
      setBannerForm({
        title: '',
        placement: 'Home Top',
        image: '',
        enabled: true
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!bannerForm.title.trim()) newErrors.title = 'Banner title is required';
    if (!bannerForm.image.trim()) newErrors.image = 'Image URL is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsModalOpen(false);
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
          {currentBanners.map((banner) => (
            <div key={banner.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 bg-gray-200 rounded overflow-hidden">
                  <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{banner.title}</h4>
                  <p className="text-xs text-gray-500">Placement: {banner.placement}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('edit', banner)}
                  className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button className="p-2 border border-gray-200 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={mockBanners.length}
          itemsPerPage={itemsPerPage}
        />
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Banner' : 'Edit Banner'}
      >
        <form className="space-y-4" onSubmit={handleBannerSubmit} noValidate>
          <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
            <span className="text-sm font-medium text-gray-700">Enable Banner</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={bannerForm.enabled} onChange={e => setBannerForm({...bannerForm, enabled: e.target.checked})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
              <select value={bannerForm.placement} onChange={e => setBannerForm({...bannerForm, placement: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white">
                <option value="Home Top">Home Top</option>
                <option value="Home Middle">Home Middle</option>
                <option value="Category Top">Category Top</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" value={bannerForm.image} onChange={e => {
              setBannerForm({...bannerForm, image: e.target.value});
              if (errors.image) setErrors({...errors, image: undefined});
            }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.image ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} placeholder="https://..." />
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                <option>Product</option>
                <option>Category</option>
                <option>Promotional Page</option>
                <option>External URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target (ID or URL)</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black" placeholder="/collections/summer" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Start</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule End</label>
              <input type="datetime-local" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Banner</button>
          </div>
        </form>
      </AdminModal>
    </>
  );
};
