import { useState, useEffect } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
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
        const res = await adminProductApi.getProducts({ page: currentPage, limit: itemsPerPage, search: searchQuery });
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
    categoryId: string;
    brandId: string;
    mrp: string;
    price: string;
    status: string;
    image: string;
    imageFile?: File | null;
  }>({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    mrp: '',
    price: '',
    status: 'draft',
    image: '',
    imageFile: null
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

  const openModal = async (mode: 'add' | 'edit', product: any = null) => {
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

      setProductForm({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId?._id || product.categoryId || '',
        brandId: product.brandId?._id || product.brandId || '',
        mrp: initialMrp,
        price: initialPrice,
        status: product.status || 'draft',
        image: product.thumbnail || product.image || product.images?.[0]?.url || '',
        imageFile: null
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
        categoryId: categories.length > 0 ? (categories[0].id || categories[0]._id) : '',
        brandId: brands.length > 0 ? (brands[0].id || brands[0]._id) : '',
        mrp: '',
        price: '',
        status: 'draft',
        image: '',
        imageFile: null
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
    if (!productForm.image.trim()) newErrors.image = 'Image URL is required';

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
      formData.append('categoryId', productForm.categoryId);
      formData.append('brandId', productForm.brandId);
      formData.append('status', productForm.status);
      if (productForm.imageFile) {
        formData.append('thumbnail', productForm.imageFile);
      } else if (productForm.image) {
        formData.append('thumbnail', productForm.image);
      }
      
      let productId = (selectedProduct as any)?._id || selectedProduct?.id;
      
      if (modalMode === 'add') {
        const res = await adminProductApi.createProduct(formData);
        productId = (res.product as any)?._id || res.product?.id;
      } else if (productId) {
        await adminProductApi.updateProduct(productId, formData);
      }
      
      if (productId) {
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
              try {
                await adminProductApi.createVariant(productId, variantData);
              } catch (err: any) {
                const msg = err.response?.data?.message || err.message;
                if (modalMode === 'add' || !msg?.includes('already exists')) {
                  toast.error(`Variant error: ${msg}`);
                }
              }
            }
          }
        }
      }
      
      toast.success(`Product ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
      setIsModalOpen(false);
      
      // Refresh products (same logic as fetchProducts)
      const refreshRes = await adminProductApi.getProducts({ page: currentPage, limit: itemsPerPage, search: searchQuery });
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status?.toLowerCase() === 'active' || product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : (product.isActive ? 'Active' : 'Inactive')}
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
        title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
      >
        {isFetchingVariants ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading product variants...</p>
          </div>
        ) : (
        <form className="space-y-4" onSubmit={handleProductSubmit} noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              {productForm.image && (
                <img src={productForm.image} alt="Preview" className="w-16 h-16 rounded object-cover border border-gray-200" />
              )}
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  setCropImageSrc(URL.createObjectURL(file));
                }
                e.target.value = ''; // Reset input to allow selecting the same file again
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.image ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} text-sm`} />
            </div>
            {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" value={productForm.name} onChange={e => {
              setProductForm({...productForm, name: e.target.value});
              if (errors.name) setErrors({...errors, name: undefined});
            }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} placeholder="E.g., Classic White Tee" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white">
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select value={productForm.brandId} onChange={e => setProductForm({...productForm, brandId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white">
                <option value="">Select Brand</option>
                {brands.map(b => (
                  <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (Rs.)</label>
              <input type="number" value={productForm.mrp} onChange={e => {
                setProductForm({...productForm, mrp: e.target.value});
                if (errors.mrp) setErrors({...errors, mrp: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.mrp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} placeholder="1299" />
              {errors.mrp && <p className="mt-1 text-xs text-red-500">{errors.mrp}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Rs.)</label>
              <input type="number" value={productForm.price} onChange={e => {
                setProductForm({...productForm, price: e.target.value});
                if (errors.price) setErrors({...errors, price: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'}`} placeholder="999" />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={productForm.status} onChange={e => setProductForm({...productForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-bold mb-3 uppercase">Variants & Inventory</h4>
            
            {variants.map((v, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color Name</label>
                    <input type="text" value={v.color} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].color = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="E.g., Black" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color Images (Comma separated URLs)</label>
                    <input type="text" value={v.images} onChange={e => {
                      const newVariants = [...variants];
                      newVariants[index].images = e.target.value;
                      setVariants(newVariants);
                    }} placeholder="URL1, URL2" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black" />
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
            <LoadingButton type="submit" isLoading={loading} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save Product</LoadingButton>
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
              imageFile: croppedFile,
              image: URL.createObjectURL(croppedFile)
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
