import { useState, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIsStoreManager, selectCurrentUser } from '../../features/auth/authSlice';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminProductApi } from '../../services/admin/adminProduct.Api';
import { adminCategoriesApi } from '../../services/admin/admincategories.Api';
import { adminBrandApi } from '../../services/admin/adminBrand.Api';
import { ImageCropper } from '../../components/common/ImageCropper';
import { LoadingButton } from '../../components/common/LoadingButton';

interface FormErrors {
  name?: string;
  mrp?: string;
  price?: string;
  image?: string;
}

export const AdminProducts = () => {
  const isStoreManager = useAppSelector(selectIsStoreManager);
  const currentUser = useAppSelector(selectCurrentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          adminCategoriesApi.getCategories({ limit: 100 }),
          adminBrandApi.getBrands({ limit: 100 })
        ]);
        setCategories(catRes.categories || []);
        setBrands(brandRes.brands || []);
      } catch (error) {
        console.error("Failed to fetch categories or brands", error);
      }
    };
    fetchSelectData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = { page: currentPage, limit: itemsPerPage, search: searchQuery };
        if (isStoreManager && currentUser) {
          params.createdBy = currentUser.id || currentUser._id;
        }
        const res = await adminProductApi.getProducts(params);
        const fetchedProducts = res.products || [];
        
        // Fetch variants for all products to get their prices
        const productsWithVariants = await Promise.all(
          fetchedProducts.map(async (p: any) => {
            try {
              const productId = p._id || p.id;
              const vRes = await adminProductApi.getVariants(productId);
              const variants = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
              if (variants.length > 0) {
                p.price = variants[0].salePrice || variants[0].price;
                p.mrp = variants[0].costPrice;
              }
              return p;
            } catch (err) {
              return p;
            }
          })
        );
        
        setProducts(productsWithVariants);
        setTotalItems(res.total || 0);
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchQuery]);

  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    shortDescription: string;
    categoryId: string;
    brandId: string;
    mrp: string;
    price: string;
    status: string;
    isFeatured: boolean;
    tags: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    images: { url: string; file?: File | null }[];
  }>({
    name: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    brandId: '',
    mrp: '',
    price: '',
    status: 'active',
    isFeatured: false,
    tags: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    images: []
  });
  
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  
  const [variants, setVariants] = useState<{
    color: string;
    images: string;
    size28: string;
    size30: string;
    size32: string;
    size34: string;
  }[]>([
    { color: '', images: '', size28: '', size30: '', size32: '', size34: '' }
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFetchingVariants, setIsFetchingVariants] = useState(false);
  const [existingVariants, setExistingVariants] = useState<any[]>([]);

  const handleRemoveVariantBlock = async (index: number) => {
    const variantToRemove = variants[index];
    if (variantToRemove.color && selectedProduct && modalMode === 'edit') {
      const matchingVariants = existingVariants.filter(ev => ev.attributes?.color?.toLowerCase() === variantToRemove.color.toLowerCase());
      
      if (matchingVariants.length > 0) {
        try {
          setIsFetchingVariants(true);
          await Promise.all(matchingVariants.map(v => adminProductApi.deleteVariant(v._id || v.id)));
          toast.success(`Removed variants for color ${variantToRemove.color}`);
          setExistingVariants(existingVariants.filter(ev => ev.attributes?.color?.toLowerCase() !== variantToRemove.color.toLowerCase()));
        } catch (err: any) {
          toast.error("Failed to delete variants from server");
          setIsFetchingVariants(false);
          return;
        } finally {
          setIsFetchingVariants(false);
        }
      }
    }
    
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const openModal = async (mode: 'add' | 'edit' | 'delete', product: any = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    if (mode === 'edit' && product) {
      setIsFetchingVariants(true);
      
      let fetchedVariants: any[] = [];
      try {
        const productId = product._id || product.id;
        if (productId) {
          const res = await adminProductApi.getVariants(productId);
          fetchedVariants = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
          setExistingVariants(fetchedVariants);
        }
      } catch (error) {
        console.error("Failed to fetch variants", error);
      }
      
      let initialPrice = product.price ? String(product.price) : '';
      let initialMrp = product.price ? String(product.price + 300) : '';
      
      const variantsByColor: Record<string, any> = {};
      
      if (fetchedVariants.length > 0) {
        // Use price from the first variant if available
        initialPrice = fetchedVariants[0].salePrice || fetchedVariants[0].price ? String(fetchedVariants[0].salePrice || fetchedVariants[0].price) : initialPrice;
        initialMrp = fetchedVariants[0].costPrice ? String(fetchedVariants[0].costPrice) : initialMrp;
        
        fetchedVariants.forEach(v => {
          const color = v.attributes?.color || '';
          const size = v.attributes?.size || '';
          
          if (!variantsByColor[color]) {
            variantsByColor[color] = {
              color,
              images: Array.isArray(v.images) ? v.images.join(', ') : '',
              size28: '', size30: '', size32: '', size34: ''
            };
          }
          
          if (size === '28') variantsByColor[color].size28 = '1';
          if (size === '30') variantsByColor[color].size30 = '1';
          if (size === '32') variantsByColor[color].size32 = '1';
          if (size === '34') variantsByColor[color].size34 = '1';
        });
      }
      
      const mappedVariants = Object.values(variantsByColor);

      const initialImages = [];
      if (product.thumbnail || product.image) {
        initialImages.push({ url: product.thumbnail || product.image });
      } else if (Array.isArray(product.images) && product.images.length > 0) {
        initialImages.push({ url: product.images[0]?.url || product.images[0] });
      }
      
      if (Array.isArray(product.gallery) && product.gallery.length > 0) {
        product.gallery.forEach((g: any) => {
          initialImages.push({ url: g.url || g });
        });
      }

      setProductForm({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        categoryId: product.categoryId?._id || product.categoryId || '',
        brandId: product.brandId?._id || product.brandId || '',
        mrp: initialMrp,
        price: initialPrice,
        status: product.status || 'active',
        isFeatured: product.isFeatured || false,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        seoTitle: product.seo?.title || '',
        seoDescription: product.seo?.description || '',
        seoKeywords: Array.isArray(product.seo?.keywords) ? product.seo.keywords.join(', ') : (product.seo?.keywords || ''),
        images: initialImages
      });
      
      if (mappedVariants.length > 0) {
        setVariants(mappedVariants as any);
      } else {
        setVariants([{ color: '', images: '', size28: '', size30: '', size32: '', size34: '' }]);
      }
      
      setIsFetchingVariants(false);
    } else {
      setProductForm({
        name: '',
        description: '',
        shortDescription: '',
        categoryId: categories.length > 0 ? (categories[0].id || categories[0]._id) : '',
        brandId: brands.length > 0 ? (brands[0].id || brands[0]._id) : '',
        mrp: '',
        price: '',
        status: 'active',
        isFeatured: false,
        tags: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        images: []
      });
      setVariants([{ color: '', images: '', size28: '', size30: '', size32: '', size34: '' }]);
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!productForm.name.trim()) newErrors.name = 'Product name is required';
    if (!productForm.mrp) newErrors.mrp = 'MRP is required';
    if (!productForm.price) newErrors.price = 'Discount price is required';
    if (productForm.images.length === 0) newErrors.image = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('slug', productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      formData.append('description', productForm.description || '');
      formData.append('shortDescription', productForm.shortDescription || '');
      formData.append('categoryId', productForm.categoryId);
      formData.append('brandId', productForm.brandId);
      formData.append('status', productForm.status);
      formData.append('isFeatured', String(productForm.isFeatured));
      
      const tagsArray = productForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagsArray.length > 0) formData.append('tags', JSON.stringify(tagsArray));
      
      if (productForm.seoTitle) formData.append('seo[title]', productForm.seoTitle);
      if (productForm.seoDescription) formData.append('seo[description]', productForm.seoDescription);
      
      const keywordsArray = productForm.seoKeywords.split(',').map(t => t.trim()).filter(Boolean);
      if (keywordsArray.length > 0) formData.append('seo[keywords]', JSON.stringify(keywordsArray));
      
      if (productForm.images.length > 0) {
        const firstImg = productForm.images[0];
        if (firstImg.file) {
          formData.append('thumbnail', firstImg.file);
        } else if (firstImg.url && !firstImg.url.startsWith('blob:')) {
          formData.append('thumbnail', firstImg.url);
        }

        const gallery = productForm.images.slice(1);
        if (gallery.length > 0) {
          gallery.forEach(img => {
            if (img.file) {
              formData.append('gallery', img.file);
            } else if (img.url && !img.url.startsWith('blob:')) {
              formData.append('existingGallery', img.url);
            }
          });
        }
      }
      
      // Ensure price fields are sent in the main product form data
      if (productForm.price) {
        formData.append('price', productForm.price);
        formData.append('salePrice', productForm.price);
      }
      if (productForm.mrp) {
        formData.append('mrp', productForm.mrp);
        formData.append('costPrice', productForm.mrp);
      }
      
      let productId = (selectedProduct as any)?._id || selectedProduct?.id;
      
      if (modalMode === 'add') {
        const res = await adminProductApi.createProduct(formData);
        productId = (res.product as any)?._id || res.product?.id;
      } else if (productId) {
        await adminProductApi.updateProduct(productId, formData);
      }
      
      if (productId) {
        let existingVariants: any[] = [];
        try {
           const vRes = await adminProductApi.getVariants(productId);
           existingVariants = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
        } catch(e) {}

        for (const v of variants) {
          if (!v.color) continue;
          
          const sizes = [
            { size: '28', qty: v.size28 },
            { size: '30', qty: v.size30 },
            { size: '32', qty: v.size32 },
            { size: '34', qty: v.size34 },
          ];
          
          for (const s of sizes) {
            if (s.qty && parseInt(s.qty) > 0) {
              const variantData = {
                sku: `${productForm.name.substring(0, 3).toUpperCase()}-${v.color.toUpperCase().substring(0,3)}-${s.size}`,
                attributes: { color: v.color, size: s.size },
                price: parseFloat(productForm.price),
                salePrice: parseFloat(productForm.price),
                costPrice: parseFloat(productForm.mrp),
                images: v.images.split(',').map(i => i.trim()).filter(i => i),
                status: 'active'
              };
              
              const existingVariant = existingVariants.find(ev => 
                 ev.attributes?.color?.toLowerCase() === v.color.toLowerCase() && 
                 ev.attributes?.size === s.size
              );

              try {
                if (existingVariant) {
                  await adminProductApi.updateVariant(existingVariant._id || existingVariant.id, variantData);
                } else {
                  await adminProductApi.createVariant(productId, variantData);
                }
              } catch (err: any) {
                const msg = err.response?.data?.message || err.message;
                if (modalMode === 'add' || (!msg?.includes('already exists') && !msg?.includes('duplicate'))) {
                  toast.error(`Variant error for ${v.color} ${s.size}: ${msg}`);
                }
              }
            }
          }
        }
      }
      
      toast.success(`Product ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
      setIsModalOpen(false);
      
      // Refresh products (same logic as fetchProducts)
      const refreshParams: any = { page: currentPage, limit: itemsPerPage, search: searchQuery };
      if (isStoreManager && currentUser) {
        refreshParams.createdBy = currentUser.id || currentUser._id;
      }
      const refreshRes = await adminProductApi.getProducts(refreshParams);
      const fetchedProducts = refreshRes.products || [];
      const productsWithVariants = await Promise.all(
        fetchedProducts.map(async (p: any) => {
          try {
            const vRes = await adminProductApi.getVariants(p._id || p.id);
            const vars = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
            if (vars.length > 0) {
              p.price = vars[0].salePrice || vars[0].price;
              p.mrp = vars[0].costPrice;
            }
            return p;
          } catch (err) {
            return p;
          }
        })
      );
      setProducts(productsWithVariants);
      setTotalItems(refreshRes.total || 0);
      
    } catch (error: any) {
      console.error("Failed to save product", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    const productId = selectedProduct._id || selectedProduct.id;
    try {
      setLoading(true);
      await adminProductApi.deleteProduct(productId);
      toast.success('Product deleted successfully');
      
      // Refresh products
      const refreshParams: any = { page: currentPage, limit: itemsPerPage, search: searchQuery };
      if (isStoreManager && currentUser) {
        refreshParams.createdBy = currentUser.id || currentUser._id;
      }
      const refreshRes = await adminProductApi.getProducts(refreshParams);
      const fetchedProducts = refreshRes.products || [];
      const productsWithVariants = await Promise.all(
        fetchedProducts.map(async (p: any) => {
          try {
            const vRes = await adminProductApi.getVariants(p._id || p.id);
            const vars = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
            if (vars.length > 0) {
              p.price = vars[0].salePrice || vars[0].price;
              p.mrp = vars[0].costPrice;
            }
            return p;
          } catch (err) {
            return p;
          }
        })
      );
      setProducts(productsWithVariants);
      setTotalItems(refreshRes.total || 0);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to delete product", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (product: any) => {
    try {
      const currentStatus = product.status?.toLowerCase() === 'active' || product.isActive ? 'active' : 'inactive';
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await adminProductApi.updateProductStatus(product._id || product.id, newStatus);
      toast.success(`Product marked as ${newStatus}`);
      
      setProducts(products.map(p => {
        if ((p._id || p.id) === (product._id || product.id)) {
          return { ...p, status: newStatus, isActive: newStatus === 'active' };
        }
        return p;
      }));
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const currentProducts = products;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-primary border border-gray-200 px-3 py-2 rounded-lg text-sm">
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : currentProducts.length > 0 ? (
                currentProducts.map(product => (
                  <tr key={product.id || product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-4">
                      <img src={product.thumbnail || product.image || product.images?.[0]?.url || 'https://via.placeholder.com/150'} alt={product.name} className="w-12 h-12 rounded object-cover border border-gray-200" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.categoryId?.name || product.category?.name || product.category || 'Uncategorized'}</td>
                    <td className="py-4 px-4 font-medium">
                      {product.price ? (
                        <div className="flex flex-col">
                          <span className="text-sm">Rs. {product.price.toLocaleString('en-IN')}</span>
                          {product.mrp && <span className="text-xs text-gray-400 line-through">Rs. {product.mrp.toLocaleString('en-IN')}</span>}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${product.status?.toLowerCase() === 'active' || product.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title="Click to toggle status"
                      >
                        {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : (product.isActive ? 'Active' : 'Inactive')}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal('edit', product)}
                          className="p-1.5 text-gray-400 hover:text-primary transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!isStoreManager && (
                          <button onClick={() => openModal('delete', product)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
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
        
        {totalItems > 0 && (
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        )}
      </PageWrapper>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Product' : modalMode === 'edit' ? 'Edit Product' : 'Delete Product'}
      >
        {modalMode === 'delete' ? (
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedProduct?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={loading} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <LoadingButton onClick={handleDeleteProduct} isLoading={loading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50">
                Delete Product
              </LoadingButton>
            </div>
          </div>
        ) : isFetchingVariants ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading product variants...</p>
          </div>
        ) : (
        <form className="space-y-4" onSubmit={handleProductSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <div className="flex flex-col gap-4">
              {productForm.images.length > 0 && (
                <div className="flex flex-wrap items-center gap-4">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img.url} alt={`Preview ${idx}`} className="w-16 h-16 rounded object-cover border border-gray-200" />
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = [...productForm.images];
                          newImages.splice(idx, 1);
                          setProductForm({...productForm, images: newImages});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" accept="image/*" multiple onChange={e => {
                const files = Array.from(e.target.files || []);
                if (files.length === 1) {
                  setCropImageSrc(URL.createObjectURL(files[0]));
                } else if (files.length > 1) {
                  const newImages = files.map(file => ({
                    url: URL.createObjectURL(file),
                    file: file
                  }));
                  setProductForm({
                    ...productForm,
                    images: [...productForm.images, ...newImages]
                  });
                  if (errors.image) setErrors({ ...errors, image: undefined });
                }
                e.target.value = ''; 
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.image ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'} text-sm`} />
            </div>
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" value={productForm.name} onChange={e => {
              setProductForm({...productForm, name: e.target.value});
              if (errors.name) setErrors({...errors, name: undefined});
            }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="E.g., Classic White Tee" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select value={productForm.brandId} onChange={e => setProductForm({...productForm, brandId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="">Select Brand</option>
                {brands.map(b => (
                  <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Short Description</label>
              {(() => {
                const selectedCat = categories.find(c => (c.id || c._id) === productForm.categoryId);
                let categorySuggestions = selectedCat?.suggestions || [];
                
                // Fallback in case the backend stored it as a stringified JSON array
                if (typeof categorySuggestions === 'string') {
                  try { categorySuggestions = JSON.parse(categorySuggestions); } catch(e){}
                } else if (Array.isArray(categorySuggestions) && categorySuggestions.length > 0 && typeof categorySuggestions[0] === 'string') {
                  try { categorySuggestions = JSON.parse(categorySuggestions[0]); } catch(e){}
                }

                if (Array.isArray(categorySuggestions) && categorySuggestions.length > 0) {
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Insert template:</span>
                      <select 
                        onChange={e => {
                          const val = e.target.value;
                          if (val) {
                            setProductForm(prev => ({ ...prev, shortDescription: val }));
                            e.target.selectedIndex = 0; // Reset so they can select again
                          }
                        }}
                        className="text-xs border border-gray-300 rounded focus:outline-none focus:border-primary py-0.5 px-1 bg-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a suggestion...</option>
                        {categorySuggestions.map((s: any, idx: number) => {
                          const title = s?.title || `Suggestion ${idx + 1}`;
                          const desc = s?.description || '';
                          return <option key={idx} value={desc}>{title}</option>;
                        })}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <input type="text" value={productForm.shortDescription} onChange={e => setProductForm({...productForm, shortDescription: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="A short catchphrase..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-24" placeholder="Detailed product description..."></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="shirt, cotton, formal" />
            </div>
            <div className="flex items-center mt-6">
              <input type="checkbox" id="isFeatured" checked={productForm.isFeatured} onChange={e => setProductForm({...productForm, isFeatured: e.target.checked})} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Is Featured Product?</label>
            </div>
          </div>

          <div className="border border-gray-200 p-3 rounded-md space-y-3">
            <h4 className="text-sm font-semibold">SEO Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SEO Title</label>
                <input type="text" value={productForm.seoTitle} onChange={e => setProductForm({...productForm, seoTitle: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="SEO Title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SEO Keywords</label>
                <input type="text" value={productForm.seoKeywords} onChange={e => setProductForm({...productForm, seoKeywords: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="keyword1, keyword2" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SEO Description</label>
              <textarea value={productForm.seoDescription} onChange={e => setProductForm({...productForm, seoDescription: e.target.value})} className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-16" placeholder="SEO meta description..."></textarea>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (Rs.)</label>
              <input type="number" value={productForm.mrp} onChange={e => {
                setProductForm({...productForm, mrp: e.target.value});
                if (errors.mrp) setErrors({...errors, mrp: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.mrp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="1299" />
              {errors.mrp && <p className="mt-1 text-xs text-red-500">{errors.mrp}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Rs.)</label>
              <input type="number" value={productForm.price} onChange={e => {
                setProductForm({...productForm, price: e.target.value});
                if (errors.price) setErrors({...errors, price: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="999" />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-bold mb-3 uppercase">Variants & Inventory</h4>

            {variants.map((v, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 relative">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariantBlock(index)}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove Variant"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border border-gray-300 shadow-sm flex-shrink-0" 
                        style={{ 
                          backgroundColor: [
                            {name:'Black',hex:'#000000'}, {name:'White',hex:'#FFFFFF'}, {name:'Red',hex:'#ef4444'}, {name:'Blue',hex:'#3b82f6'},
                            {name:'Green',hex:'#22c55e'}, {name:'Yellow',hex:'#eab308'}, {name:'Pink',hex:'#ec4899'}, {name:'Purple',hex:'#a855f7'},
                            {name:'Orange',hex:'#f97316'}, {name:'Grey',hex:'#6b7280'}, {name:'Brown',hex:'#78350f'}, {name:'Navy',hex:'#1e3a8a'},
                            {name:'Olive',hex:'#3f6212'}, {name:'Maroon',hex:'#7f1d1d'}
                          ].find(c => c.name.toLowerCase() === v.color.toLowerCase())?.hex || v.color || 'transparent' 
                        }} 
                      />
                      <input type="text" value={v.color} onChange={e => {
                        const newVariants = [...variants];
                        newVariants[index].color = e.target.value;
                        setVariants(newVariants);
                      }} placeholder="E.g., Black" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-primary" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        {name:'Black',hex:'#000000'}, {name:'White',hex:'#FFFFFF'}, {name:'Red',hex:'#ef4444'}, {name:'Blue',hex:'#3b82f6'},
                        {name:'Green',hex:'#22c55e'}, {name:'Yellow',hex:'#eab308'}, {name:'Pink',hex:'#ec4899'}, {name:'Purple',hex:'#a855f7'},
                        {name:'Orange',hex:'#f97316'}, {name:'Grey',hex:'#6b7280'}, {name:'Brown',hex:'#78350f'}, {name:'Navy',hex:'#1e3a8a'},
                        {name:'Olive',hex:'#3f6212'}, {name:'Maroon',hex:'#7f1d1d'}
                      ].map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            const newVariants = [...variants];
                            newVariants[index].color = c.name;
                            setVariants(newVariants);
                          }}
                          className={`w-5 h-5 rounded-full shadow-sm hover:scale-110 transition-transform ${v.color.toLowerCase() === c.name.toLowerCase() ? 'ring-2 ring-offset-1 ring-primary border-transparent' : 'border border-gray-300'}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color Images (Comma separated URLs)</label>
                    <input type="text" value={v.images} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].images = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="URL1, URL2" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Size Inventory</label>
                <div className="grid grid-cols-4 gap-2">
                  <input type="number" value={v.size28} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].size28 = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="Size 28 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                  <input type="number" value={v.size30} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].size30 = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="Size 30 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                  <input type="number" value={v.size32} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].size32 = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="Size 32 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                  <input type="number" value={v.size34} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].size34 = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="Size 34 Qty" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md" />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setVariants([...variants, { color: '', images: '', size28: '', size30: '', size32: '', size34: '' }])} className="mt-2 text-xs text-[#e35a39] font-medium hover:underline flex items-center">
              <Plus size={12} className="mr-1" /> Add Another Color Variant
            </button>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            <LoadingButton type="submit" isLoading={loading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-colors">Save Product</LoadingButton>
          </div>
        </form>
        )}
      </AdminModal>

      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={(croppedFile) => {
            setProductForm({
              ...productForm,
              images: [...productForm.images, {
                url: URL.createObjectURL(croppedFile),
                file: croppedFile
              }]
            });
            setCropImageSrc(null);
            if (errors.image) setErrors({ ...errors, image: undefined });
          }}
          onCancel={() => setCropImageSrc(null)}
          aspectRatio={1} // Assuming square images for products, adjust if needed
        />
      )}
    </>
  );
};
