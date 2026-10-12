import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { LoadingButton } from '../../components/common/LoadingButton';
import { adminOfferApi } from '../../services/admin/adminOffer.Api';
import { adminProductApi } from '../../services/admin/adminProduct.Api';
import type { Offer, Product } from '../../types';

interface FormErrors {
  name?: string;
  discountValue?: string;
  startDate?: string;
  endDate?: string;
  productId?: string;
}

export const AdminOffers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalOffers, setTotalOffers] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [offerForm, setOfferForm] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    startDate: '',
    endDate: '',
    productId: '',
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalOffers / itemsPerPage) || 1;

  const fetchOffers = async () => {
    setIsLoadingData(true);
    try {
      const response = await adminOfferApi.getOffers({
        page: currentPage,
        limit: itemsPerPage
      });
      setOffers(response.offers);
      setTotalOffers(response.total);
    } catch (error) {
      console.error('Failed to fetch offers', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      // Fetch products for dropdown, we might need a higher limit or a search mechanism
      const response = await adminProductApi.getProducts({ limit: 100 });
      setProducts(response.products);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [currentPage]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const toDateTimeLocal = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getOfferProductName = (offer: Offer) => {
    if (offer.productId && typeof offer.productId === 'object') {
      return (offer.productId as any).name || (offer.productId as any).title || 'Product';
    }
    if (offer.product && typeof offer.product === 'object') {
      return offer.product.name || offer.product.title || 'Product';
    }
    if (typeof offer.productId === 'string' && offer.productId) {
      const foundProduct = products.find(p => (p._id || (p as any).id) === offer.productId);
      return foundProduct ? foundProduct.name : offer.productId;
    }
    return 'All Products';
  };

  const openModal = (mode: 'add' | 'edit', offer: Offer | null = null) => {
    setModalMode(mode);
    setSelectedOffer(offer);
    if (mode === 'edit' && offer) {
      let prodId = '';
      if (offer.productId && typeof offer.productId === 'object') {
        prodId = (offer.productId as any)._id || (offer.productId as any).id || '';
      } else if (typeof offer.productId === 'string') {
        prodId = offer.productId;
      } else if (offer.product) {
        prodId = typeof offer.product === 'object' ? (offer.product._id || offer.product.id || '') : offer.product;
      }

      setOfferForm({
        name: offer.name || '',
        description: offer.description || '',
        discountType: offer.discountType || 'percentage',
        discountValue: offer.discountValue?.toString() || '',
        startDate: toDateTimeLocal(offer.startDate),
        endDate: toDateTimeLocal(offer.endDate),
        productId: prodId,
        isActive: offer.isActive ?? true
      });
    } else {
      setOfferForm({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        endDate: '',
        productId: '',
        isActive: true
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    try {
      await adminOfferApi.deleteOffer(offerToDelete);
      fetchOffers();
      setIsDeleteModalOpen(false);
      setOfferToDelete(null);
    } catch (error) {
      console.error('Failed to delete offer', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setOfferToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!offerForm.name.trim()) newErrors.name = 'Offer name is required';
    if (!offerForm.discountValue) newErrors.discountValue = 'Discount value is required';
    if (!offerForm.startDate) newErrors.startDate = 'Start date is required';
    if (!offerForm.endDate) newErrors.endDate = 'End date is required';
    
    if (offerForm.startDate && offerForm.endDate) {
      if (new Date(offerForm.startDate) >= new Date(offerForm.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please check the form for errors and fill all required fields.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...offerForm,
        discountValue: Number(offerForm.discountValue),
        startDate: new Date(offerForm.startDate).toISOString(),
        endDate: new Date(offerForm.endDate).toISOString(),
        productId: offerForm.productId || null,
      };

      if (modalMode === 'add') {
        await adminOfferApi.createOffer(payload);
        toast.success('Offer created successfully');
      } else {
        const idToUpdate = selectedOffer?._id || (selectedOffer as any)?.id;
        if (idToUpdate) {
          await adminOfferApi.updateOffer(idToUpdate, payload);
          toast.success('Offer updated successfully');
        }
      }
      setIsModalOpen(false);
      fetchOffers();
    } catch (error: any) {
      console.error('Failed to save offer:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatus = (offer: Offer) => {
    if (!offer.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600' };
    
    if (offer.startDate && offer.endDate) {
      const now = new Date();
      const start = new Date(offer.startDate);
      const end = new Date(offer.endDate);

      if (!isNaN(start.getTime()) && now < start) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
      if (!isNaN(end.getTime()) && now > end) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    }
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <>
      <PageWrapper 
        title="Offers"
        headerAction={
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchOffers}
              className="p-2 text-gray-500 hover:text-primary transition-colors border border-gray-300 rounded-lg bg-white"
              title="Refresh"
            >
              <RefreshCw size={18} className={isLoadingData ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => openModal('add')}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Create Offer</span>
            </button>
          </div>
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
                  <th className="pb-3 font-medium px-4">Offer Name</th>
                  <th className="pb-3 font-medium px-4">Product</th>
                  <th className="pb-3 font-medium px-4">Discount</th>
                  <th className="pb-3 font-medium px-4">Duration</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                  <th className="pb-3 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No offers found</td>
                  </tr>
                ) : (
                  offers.map((offer) => {
                    const offerId = offer._id || (offer as any).id || '';
                    const statusInfo = getStatus(offer);
                    const productName = getOfferProductName(offer);
                      
                    return (
                      <tr key={offerId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">{offer.name}</td>
                        <td className="py-4 px-4 text-gray-600 truncate max-w-[200px]" title={productName}>
                          {productName}
                        </td>
                        <td className="py-4 px-4 text-green-600 font-medium">
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          <div className="text-xs">{formatDate(offer.startDate)}</div>
                          <div className="text-xs text-gray-400">to {formatDate(offer.endDate)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openModal('edit', offer)} className="p-1.5 text-gray-400 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => openDeleteModal(offerId)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <AdminPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalOffers}
          itemsPerPage={itemsPerPage}
        />
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Create Offer' : 'Edit Offer'}
      >
        <form className="space-y-4" onSubmit={handleOfferSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Name</label>
            <input type="text" value={offerForm.name} onChange={e => {
              setOfferForm({...offerForm, name: e.target.value});
              if (errors.name) setErrors({...errors, name: undefined});
            }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="Weekend Sale" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={offerForm.description} onChange={e => setOfferForm({...offerForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="Get 20% off on this specific product" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select value={offerForm.discountType} onChange={e => setOfferForm({...offerForm, discountType: e.target.value as 'percentage' | 'fixed'})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input type="number" value={offerForm.discountValue} onChange={e => {
                setOfferForm({...offerForm, discountValue: e.target.value});
                if (errors.discountValue) setErrors({...errors, discountValue: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.discountValue ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="20" />
              {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <input type="datetime-local" value={offerForm.startDate} onChange={e => {
                setOfferForm({...offerForm, startDate: e.target.value});
                if (errors.startDate) setErrors({...errors, startDate: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
              {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input type="datetime-local" value={offerForm.endDate} onChange={e => {
                setOfferForm({...offerForm, endDate: e.target.value});
                if (errors.endDate) setErrors({...errors, endDate: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.endDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} />
              {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional - leave as Storewide for all products)</label>
            <div className="relative">
              <div className="w-full border border-gray-300 rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-md flex items-center justify-between">
                  <input 
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm px-1"
                  />
                  {offerForm.productId && (
                    <button
                      type="button"
                      onClick={() => setOfferForm({ ...offerForm, productId: '' })}
                      className="text-xs text-gray-500 hover:text-red-500 whitespace-nowrap ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto bg-white rounded-b-md">
                  <div
                    onClick={() => setOfferForm({ ...offerForm, productId: '' })}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${!offerForm.productId ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-[11px] font-semibold">ALL</span>
                    </div>
                    <span className={`text-sm ${!offerForm.productId ? 'font-medium text-primary' : 'text-gray-700'}`}>
                      All Products (Storewide Offer)
                    </span>
                  </div>
                  {isLoadingProducts ? (
                    <div className="px-3 py-4 text-sm text-center text-gray-500">Loading products...</div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product: any) => {
                      const image = product.imageUrl || product.thumbnail || product.gallery?.[0];
                      const productId = product._id || product.id;
                      const isSelected = offerForm.productId === productId;
                      return (
                        <div 
                          key={productId}
                          onClick={() => {
                            setOfferForm({...offerForm, productId});
                            if (errors.productId) setErrors({...errors, productId: undefined});
                          }}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                        >
                          {image ? (
                            <img src={image} alt={product.name} className="w-10 h-10 rounded object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-[10px]">No img</span>
                            </div>
                          )}
                          <span className={`text-sm ${isSelected ? 'font-medium text-primary' : 'text-gray-700'}`}>{product.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-sm text-center text-gray-500">No products found</div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Select a specific product or choose "All Products" for a storewide offer.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input type="radio" name="isActive" className="mr-2 accent-black" checked={offerForm.isActive} onChange={() => setOfferForm({...offerForm, isActive: true})} /> Active
              </label>
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input type="radio" name="isActive" className="mr-2 accent-black" checked={!offerForm.isActive} onChange={() => setOfferForm({...offerForm, isActive: false})} /> Inactive
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <LoadingButton type="submit" isLoading={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors">Save Offer</LoadingButton>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Offer"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this offer? This action cannot be undone.</p>
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
