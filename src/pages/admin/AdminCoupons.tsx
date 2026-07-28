import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { LoadingButton } from '../../components/common/LoadingButton';
import { adminCouponApi } from '../../services/admin/adminCoupon.Api';
import type { Coupon } from '../../types';

interface FormErrors {
  code?: string;
  title?: string;
  value?: string;
  expiryDate?: string;
}


export const AdminCoupons = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minimumOrder: '',
    maximumDiscount: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCoupons / itemsPerPage) || 1;

  const fetchCoupons = async () => {
    setIsLoadingData(true);
    try {
      const response = await adminCouponApi.getCoupons({
        page: currentPage,
        limit: itemsPerPage
      });
      setCoupons(response.coupons);
      setTotalCoupons(response.total);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage]);

  const openModal = (mode: 'add' | 'edit', coupon: Coupon | null = null) => {
    setModalMode(mode);
    setSelectedCoupon(coupon);
    if (mode === 'edit' && coupon) {
      setCouponForm({
        code: coupon.code || '',
        title: coupon.title || '',
        description: coupon.description || '',
        type: coupon.type || 'percentage',
        value: coupon.value?.toString() || '',
        minimumOrder: coupon.minimumOrder?.toString() || '',
        maximumDiscount: coupon.maximumDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        isActive: coupon.isActive ?? true
      });
    } else {
      setCouponForm({
        code: '',
        title: '',
        description: '',
        type: 'percentage',
        value: '',
        minimumOrder: '',
        maximumDiscount: '',
        usageLimit: '',
        expiryDate: '',
        isActive: true
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await adminCouponApi.deleteCoupon(couponToDelete);
      fetchCoupons();
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
    } catch (error) {
      console.error('Failed to delete coupon', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setCouponToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!couponForm.code.trim()) newErrors.code = 'Coupon code is required';
    if (!couponForm.title.trim()) newErrors.title = 'Title is required';
    if (!couponForm.value) newErrors.value = 'Discount value is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...couponForm,
        value: Number(couponForm.value),
        minimumOrder: couponForm.minimumOrder ? Number(couponForm.minimumOrder) : undefined,
        maximumDiscount: couponForm.maximumDiscount ? Number(couponForm.maximumDiscount) : undefined,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined,
        expiryDate: couponForm.expiryDate ? new Date(couponForm.expiryDate).toISOString() : undefined,
      };

      if (modalMode === 'add') {
        await adminCouponApi.createCoupon(payload);
      } else {
        const idToUpdate = selectedCoupon?._id || (selectedCoupon as any)?.id;
        if (idToUpdate) {
          await adminCouponApi.updateCoupon(idToUpdate, payload);
        }
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Failed to save coupon:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageWrapper 
        title="Coupons"
        headerAction={
          <button 
            onClick={() => openModal('add')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Create Coupon</span>
          </button>
        }
      >
        <div className="overflow-x-auto min-h-[300px]">
          {isLoadingData ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 font-medium px-4">Code</th>
                  <th className="pb-3 font-medium px-4">Discount</th>
                  <th className="pb-3 font-medium px-4">Expiry</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No coupons found</td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-medium text-primary">{coupon.code}</td>
                      <td className="py-4 px-4 text-green-600 font-medium">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'No Expiry'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openModal('edit', coupon)} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => openDeleteModal(coupon._id as string)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalCoupons}
          itemsPerPage={itemsPerPage}
        />
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Create Coupon' : 'Edit Coupon'}
      >
        <form className="space-y-4" onSubmit={handleCouponSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input type="text" value={couponForm.code} onChange={e => {
                setCouponForm({...couponForm, code: e.target.value});
                if (errors.code) setErrors({...errors, code: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 uppercase transition-colors ${errors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="E.g., SUMMER50" />
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={couponForm.title} onChange={e => {
                setCouponForm({...couponForm, title: e.target.value});
                if (errors.title) setErrors({...errors, title: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="Summer Sale 20%" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Get 20% off up to ₹500..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select value={couponForm.type} onChange={e => setCouponForm({...couponForm, type: e.target.value as 'percentage' | 'fixed'})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input type="number" value={couponForm.value} onChange={e => {
                setCouponForm({...couponForm, value: e.target.value});
                if (errors.value) setErrors({...errors, value: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.value ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="20" />
              {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (Rs.)</label>
              <input type="number" value={couponForm.minimumOrder} onChange={e => setCouponForm({...couponForm, minimumOrder: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="1000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (Rs.)</label>
              <input type="number" value={couponForm.maximumDiscount} onChange={e => setCouponForm({...couponForm, maximumDiscount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (per coupon)</label>
              <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" value={couponForm.expiryDate} onChange={e => {
                setCouponForm({...couponForm, expiryDate: e.target.value});
                if (errors.expiryDate) setErrors({...errors, expiryDate: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.expiryDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
              {errors.expiryDate && <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center text-sm text-gray-600">
                <input type="radio" name="isActive" className="mr-2 accent-black" checked={couponForm.isActive} onChange={() => setCouponForm({...couponForm, isActive: true})} /> Active
              </label>
              <label className="flex items-center text-sm text-gray-600">
                <input type="radio" name="isActive" className="mr-2 accent-black" checked={!couponForm.isActive} onChange={() => setCouponForm({...couponForm, isActive: false})} /> Inactive
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <LoadingButton type="submit" isLoading={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors">Save Coupon</LoadingButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Coupon"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this coupon? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <LoadingButton 
              type="button"
              onClick={confirmDelete} 
              isLoading={isDeleting} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </LoadingButton>
          </div>
        </div>
      </AdminModal>
    </>
  );
};
