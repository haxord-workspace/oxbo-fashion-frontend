import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectIsStoreManager, selectCurrentUser } from '../../features/auth/authSlice';
import { Plus, Edit2, Trash2, Search, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminModal from '../../components/common/AdminModal';
import PageWrapper from '../../components/admin/PageWrapper';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { adminProductApi } from '../../services/admin/adminProduct.Api';
import { adminCategoriesApi } from '../../services/admin/admincategories.Api';
import { adminBrandApi } from '../../services/admin/adminBrand.Api';
import { ImageCropper } from '../../components/common/ImageCropper';
import { LoadingButton } from '../../components/common/LoadingButton';
import { CustomSelect } from '../../components/common/CustomSelect';

interface FormErrors {
  name?: string;
  mrp?: string;
  price?: string;
  image?: string;
  categoryId?: string;
  brandId?: string;
}

export const AdminProducts = () => {
  const isStoreManager = useAppSelector(selectIsStoreManager);
  const currentUser = useAppSelector(selectCurrentUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
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
        if (selectedCategoryFilter) {
          params.category = selectedCategoryFilter;
        }
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
  }, [currentPage, searchQuery, selectedCategoryFilter]);

  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    shortDescription: string;
    categoryId: string;
    subCategoryId: string;
    subSubCategoryId: string;
    brandId: string;
    mrp: string;
    price: string;
    status: string;
    isFeatured: boolean;
    isFlashSale: boolean;
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
    subCategoryId: '',
    subSubCategoryId: '',
    brandId: '',
    mrp: '',
    price: '',
    status: 'active',
    isFeatured: false,
    isFlashSale: false,
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
    imageFiles?: File[];
    applyImagesToSameColor?: boolean;
    sizes: { size: string }[];
  }[]>([
    { color: '', images: '', imageFiles: [], applyImagesToSameColor: false, sizes: [{ size: '' }] }
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFetchingVariants, setIsFetchingVariants] = useState(false);
  const [existingVariants, setExistingVariants] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<any[]>([]);
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryDropUp, setCategoryDropUp] = useState(false);
  const categoryFieldRef = useRef<HTMLDivElement>(null);
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);
  const [subCategoryDropUp, setSubCategoryDropUp] = useState(false);
  const subCategoryFieldRef = useRef<HTMLDivElement>(null);
  const [isSubSubCategoryDropdownOpen, setIsSubSubCategoryDropdownOpen] = useState(false);
  const [subSubCategoryDropUp, setSubSubCategoryDropUp] = useState(false);
  const subSubCategoryFieldRef = useRef<HTMLDivElement>(null);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandDropUp, setBrandDropUp] = useState(false);
  const brandFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCategoryDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryFieldRef.current && !categoryFieldRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCategoryDropdownOpen]);

  useEffect(() => {
    if (!isSubCategoryDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (subCategoryFieldRef.current && !subCategoryFieldRef.current.contains(event.target as Node)) {
        setIsSubCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSubCategoryDropdownOpen]);

  useEffect(() => {
    if (!isSubSubCategoryDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (subSubCategoryFieldRef.current && !subSubCategoryFieldRef.current.contains(event.target as Node)) {
        setIsSubSubCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSubSubCategoryDropdownOpen]);

  useEffect(() => {
    if (!isBrandDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (brandFieldRef.current && !brandFieldRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBrandDropdownOpen]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!productForm.categoryId) {
        setSubCategories([]);
        return;
      }
      try {
        const res = await adminCategoriesApi.getCategoryChildren(productForm.categoryId);
        setSubCategories(res.categories || []);
      } catch (error) {
        console.error("Failed to fetch subcategories", error);
        setSubCategories([]);
      }
    };
    
    fetchSubCategories();
  }, [productForm.categoryId]);

  useEffect(() => {
    const fetchSubSubCategories = async () => {
      if (!productForm.subCategoryId) {
        setSubSubCategories([]);
        return;
      }
      try {
        const res = await adminCategoriesApi.getCategoryChildren(productForm.subCategoryId);
        setSubSubCategories(res.categories || []);
      } catch (error) {
        console.error("Failed to fetch sub-subcategories", error);
        setSubSubCategories([]);
      }
    };
    
    fetchSubSubCategories();
  }, [productForm.subCategoryId]);

  // Suggested sizes for the "Size Inventory" quick-pick chips.
  // Prefer the authoritative /products/:id/size-options endpoint (handles the
  // sub-category-overrides-category rule server-side) when editing an existing
  // product; fall back to the locally-loaded category/sub-category data when
  // adding a new product, since it has no id yet for that endpoint to target.
  useEffect(() => {
    if (!isModalOpen || modalMode === 'delete') return;

    const deriveFromLocalCategories = () => {
      let opts: string[] = [];
      if (productForm.subSubCategoryId) {
        opts = subSubCategories.find(sc => (sc.id || sc._id) === productForm.subSubCategoryId)?.sizeOptions || [];
      }
      if (opts.length === 0 && productForm.subCategoryId) {
        opts = subCategories.find(sc => (sc.id || sc._id) === productForm.subCategoryId)?.sizeOptions || [];
      }
      if (opts.length === 0 && productForm.categoryId) {
        opts = categories.find(c => (c.id || c._id) === productForm.categoryId)?.sizeOptions || [];
      }
      setSizeOptions(Array.isArray(opts) ? opts : []);
    };

    const productId = (selectedProduct as any)?._id || selectedProduct?.id;
    if (modalMode === 'edit' && productId) {
      adminProductApi.getSizeOptions(productId)
        .then(res => setSizeOptions(res.data?.sizeOptions || res.sizeOptions || []))
        .catch(() => deriveFromLocalCategories());
    } else {
      deriveFromLocalCategories();
    }
  }, [isModalOpen, modalMode, selectedProduct, productForm.categoryId, productForm.subCategoryId, productForm.subSubCategoryId, categories, subCategories, subSubCategories]);

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
              imageFiles: [],
              applyImagesToSameColor: false,
              sizes: []
            };
          }
          
          if (size) {
            variantsByColor[color].sizes.push({ size });
          }
        });

        // Ensure at least one size row exists for each color
        Object.values(variantsByColor).forEach((variantBlock: any) => {
          if (variantBlock.sizes.length === 0) {
            variantBlock.sizes.push({ size: '' });
          }
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
        subCategoryId: product.subCategoryId?._id || product.subCategoryId || '',
        subSubCategoryId: product.subSubCategoryId?._id || product.subSubCategoryId || '',
        brandId: product.brandId?._id || product.brandId || '',
        mrp: initialMrp,
        price: initialPrice,
        status: product.status || 'active',
        isFeatured: product.isFeatured || false,
        isFlashSale: product.isFlashSale || false,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        seoTitle: product.seo?.title || '',
        seoDescription: product.seo?.description || '',
        seoKeywords: Array.isArray(product.seo?.keywords) ? product.seo.keywords.join(', ') : (product.seo?.keywords || ''),
        images: initialImages
      });
      
      if (mappedVariants.length > 0) {
        setVariants(mappedVariants as any);
      } else {
        setVariants([{ color: '', images: '', imageFiles: [], applyImagesToSameColor: false, sizes: [{ size: '' }] }]);
      }
      
      setIsFetchingVariants(false);
    } else {
      setProductForm({
        name: '',
        description: '',
        shortDescription: '',
        categoryId: categories.length > 0 ? (categories[0].id || categories[0]._id) : '',
        subCategoryId: '',
        subSubCategoryId: '',
        brandId: brands.length > 0 ? (brands[0].id || brands[0]._id) : '',
        mrp: '',
        price: '',
        status: 'active',
        isFeatured: false,
        isFlashSale: false,
        tags: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        images: []
      });
      setVariants([{ color: '', images: '', imageFiles: [], applyImagesToSameColor: false, sizes: [{ size: '' }] }]);
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
    if (!productForm.categoryId) newErrors.categoryId = 'Category is required';
    if (!productForm.brandId) newErrors.brandId = 'Brand is required';

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
      if (productForm.subCategoryId) {
        formData.append('subCategoryId', productForm.subCategoryId);
      }
      if (productForm.subSubCategoryId) {
        formData.append('subSubCategoryId', productForm.subSubCategoryId);
      }
      formData.append('brandId', productForm.brandId);
      formData.append('status', productForm.status);
      formData.append('isFeatured', String(productForm.isFeatured));
      formData.append('isFlashSale', String(productForm.isFlashSale));
      
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
        let hasExisting = false;
        if (gallery.length > 0) {
          gallery.forEach(img => {
            if (img.file) {
              formData.append('gallery', img.file);
            } else if (img.url && !img.url.startsWith('blob:')) {
              formData.append('existingGallery', img.url);
              hasExisting = true;
            }
          });
        }

        // If we are editing and no existing gallery images are kept, tell the backend to clear it
        if (!hasExisting && modalMode === 'edit') {
          formData.append('existingGallery', ''); 
          formData.append('clearGallery', 'true');
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
          
          for (const s of v.sizes) {
            if (s.size) {
              const variantFormData = new FormData();
              variantFormData.append('sku', `${productForm.name.substring(0, 3).toUpperCase()}-${v.color.toUpperCase().substring(0,3)}-${s.size}`);
              variantFormData.append('attributes[color]', v.color);
              variantFormData.append('attributes[size]', s.size);
              variantFormData.append('price', String(productForm.price));
              variantFormData.append('salePrice', String(productForm.price));
              variantFormData.append('costPrice', String(productForm.mrp));
              variantFormData.append('status', 'active');
              
              if (v.images) {
                const existingImgs = v.images.split(',').map(i => i.trim()).filter(Boolean);
                existingImgs.forEach(img => variantFormData.append('existingImages', img));
              }

              if (v.imageFiles && v.imageFiles.length > 0) {
                v.imageFiles.forEach(file => {
                  variantFormData.append('images', file);
                });
              }

              if (v.applyImagesToSameColor) {
                variantFormData.append('applyImagesToSameColor', 'true');
              }
              
              const existingVariant = existingVariants.find(ev => 
                 ev.attributes?.color?.toLowerCase() === v.color.toLowerCase() && 
                 ev.attributes?.size === s.size
              );

              try {
                if (existingVariant) {
                  await adminProductApi.updateVariant(existingVariant._id || existingVariant.id, variantFormData);
                } else {
                  await adminProductApi.createVariant(productId, variantFormData);
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

        // The per-size trash icon only removes the row from local form state — it never
        // tells the backend anything. Diff the sizes that existed on the server against
        // what's left in the form now, and delete whichever existing variants dropped out.
        const currentColorSizePairs = new Set(
          variants
            .filter(v => v.color)
            .flatMap(v => v.sizes.filter(s => s.size).map(s => `${v.color.toLowerCase()}|${s.size.toLowerCase()}`))
        );
        const removedVariants = existingVariants.filter(ev => {
          const color = ev.attributes?.color;
          const size = ev.attributes?.size;
          if (!color || !size) return false;
          return !currentColorSizePairs.has(`${color.toLowerCase()}|${size.toLowerCase()}`);
        });

        await Promise.all(removedVariants.map(async (ev) => {
          try {
            await adminProductApi.deleteVariant(ev._id || ev.id);
          } catch (err: any) {
            toast.error(`Failed to remove size ${ev.attributes?.size} (${ev.attributes?.color}): ${err.response?.data?.message || err.message}`);
          }
        }));
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
      
      // Fetch variants and delete them first
      try {
        const vRes = await adminProductApi.getVariants(productId);
        const productVariants = Array.isArray(vRes.data) ? vRes.data : (Array.isArray(vRes) ? vRes : []);
        
        if (productVariants.length > 0) {
          await Promise.all(productVariants.map((v: any) => adminProductApi.deleteVariant(v._id || v.id)));
        }
      } catch (variantError) {
        console.error("Error handling variants before deleting product", variantError);
      }

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
  }, [searchQuery, selectedCategoryFilter]);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto relative z-10">
            <Filter size={16} className="text-gray-500 shrink-0" />
            <CustomSelect
              name="categoryFilter"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(c => ({ value: c.id || c._id, label: c.name }))
              ]}
              className="w-full sm:w-48"
            />
          </div>
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
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex flex-col">
                        <span>{product.categoryId?.name || product.category?.name || product.category || 'Uncategorized'}</span>
                        {(product.subCategoryId?.name || product.subCategory?.name) && (
                          <span className="text-xs text-gray-400 mt-0.5">
                            Sub: {product.subCategoryId?.name || product.subCategory?.name}
                          </span>
                        )}
                      </div>
                    </td>
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
                          setProductForm(prev => {
                            const newImages = [...prev.images];
                            newImages.splice(idx, 1);
                            return { ...prev, images: newImages };
                          });
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
                  setProductForm(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages]
                  }));
                  if (errors.image) setErrors(prev => ({ ...prev, image: undefined }));
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative" ref={categoryFieldRef}>
                <div
                  onClick={() => {
                    if (categoryFieldRef.current) {
                      const rect = categoryFieldRef.current.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const spaceAbove = rect.top;
                      setCategoryDropUp(spaceBelow < 260 && spaceAbove > spaceBelow);
                    }
                    setIsCategoryDropdownOpen(o => !o);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white transition-colors cursor-pointer flex items-center justify-between ${errors.categoryId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                >
                  <span className={`truncate ${!productForm.categoryId ? 'text-gray-500' : ''}`}>
                    {categories.find(c => (c.id || c._id) === productForm.categoryId)?.name || 'Select Category'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isCategoryDropdownOpen && (
                  <div className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ${categoryDropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm({...productForm, categoryId: '', subCategoryId: ''});
                        setIsCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 truncate block"
                    >
                      Select Category
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id || c._id}
                        type="button"
                        onClick={() => {
                          setProductForm({...productForm, categoryId: c.id || c._id, subCategoryId: ''});
                          if (errors.categoryId) setErrors({...errors, categoryId: undefined});
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 truncate block ${(c.id || c._id) === productForm.categoryId ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
                        title={c.name}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
            </div>
            {subCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <div className="relative" ref={subCategoryFieldRef}>
                  <div
                    onClick={() => {
                      if (subCategoryFieldRef.current) {
                        const rect = subCategoryFieldRef.current.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const spaceAbove = rect.top;
                        setSubCategoryDropUp(spaceBelow < 260 && spaceAbove > spaceBelow);
                      }
                      setIsSubCategoryDropdownOpen(o => !o);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white transition-colors cursor-pointer flex items-center justify-between border-gray-300 focus:border-primary focus:ring-primary`}
                  >
                    <span className={`truncate ${!productForm.subCategoryId ? 'text-gray-500' : ''}`}>
                      {subCategories.find(sc => (sc.id || sc._id) === productForm.subCategoryId)?.name || 'Select Subcategory'}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${isSubCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isSubCategoryDropdownOpen && (
                    <div className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ${subCategoryDropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm({...productForm, subCategoryId: '', subSubCategoryId: ''});
                          setIsSubCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 truncate block"
                      >
                        Select Subcategory
                      </button>
                      {subCategories.map(sc => (
                        <button
                          key={sc.id || sc._id}
                          type="button"
                          onClick={() => {
                            setProductForm({...productForm, subCategoryId: sc.id || sc._id, subSubCategoryId: ''});
                            setIsSubCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 truncate block ${(sc.id || sc._id) === productForm.subCategoryId ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
                          title={sc.name}
                        >
                          {sc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {subSubCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nested Subcategory</label>
                <div className="relative" ref={subSubCategoryFieldRef}>
                  <div
                    onClick={() => {
                      if (subSubCategoryFieldRef.current) {
                        const rect = subSubCategoryFieldRef.current.getBoundingClientRect();
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const spaceAbove = rect.top;
                        setSubSubCategoryDropUp(spaceBelow < 260 && spaceAbove > spaceBelow);
                      }
                      setIsSubSubCategoryDropdownOpen(o => !o);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white transition-colors cursor-pointer flex items-center justify-between border-gray-300 focus:border-primary focus:ring-primary`}
                  >
                    <span className={`truncate ${!productForm.subSubCategoryId ? 'text-gray-500' : ''}`}>
                      {subSubCategories.find(ssc => (ssc.id || ssc._id) === productForm.subSubCategoryId)?.name || 'Select Nested Category'}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${isSubSubCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isSubSubCategoryDropdownOpen && (
                    <div className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ${subSubCategoryDropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm({...productForm, subSubCategoryId: ''});
                          setIsSubSubCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 truncate block"
                      >
                        Select Nested Category
                      </button>
                      {subSubCategories.map(ssc => (
                        <button
                          key={ssc.id || ssc._id}
                          type="button"
                          onClick={() => {
                            setProductForm({...productForm, subSubCategoryId: ssc.id || ssc._id});
                            setIsSubSubCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 truncate block ${(ssc.id || ssc._id) === productForm.subSubCategoryId ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
                          title={ssc.name}
                        >
                          {ssc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <div className="relative" ref={brandFieldRef}>
                <div
                  onClick={() => {
                    if (brandFieldRef.current) {
                      const rect = brandFieldRef.current.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      const spaceAbove = rect.top;
                      setBrandDropUp(spaceBelow < 260 && spaceAbove > spaceBelow);
                    }
                    setIsBrandDropdownOpen(o => !o);
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white transition-colors cursor-pointer flex items-center justify-between ${errors.brandId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`}
                >
                  <span className={`truncate ${!productForm.brandId ? 'text-gray-500' : ''}`}>
                    {brands.find(b => (b.id || b._id) === productForm.brandId)?.name || 'Select Brand'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isBrandDropdownOpen && (
                  <div className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto ${brandDropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm({...productForm, brandId: ''});
                        setIsBrandDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 truncate block"
                    >
                      Select Brand
                    </button>
                    {brands.map(b => (
                      <button
                        key={b.id || b._id}
                        type="button"
                        onClick={() => {
                          setProductForm({...productForm, brandId: b.id || b._id});
                          if (errors.brandId) setErrors({...errors, brandId: undefined});
                          setIsBrandDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 truncate block ${(b.id || b._id) === productForm.brandId ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'}`}
                        title={b.name}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.brandId && <p className="mt-1 text-xs text-red-500">{errors.brandId}</p>}
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
            <div className="flex flex-col justify-center mt-4 gap-3">
              <div className="flex items-center">
                <input type="checkbox" id="isFeatured" checked={productForm.isFeatured} onChange={e => setProductForm({...productForm, isFeatured: e.target.checked})} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Is Featured Product?</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isFlashSale" checked={productForm.isFlashSale} onChange={e => setProductForm({...productForm, isFlashSale: e.target.checked})} className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <label htmlFor="isFlashSale" className="ml-2 block text-sm text-gray-900">Is Flash Sale?</label>
              </div>
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
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.mrp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="1499" />
              {errors.mrp && <p className="mt-1 text-xs text-red-500">{errors.mrp}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Rs.)</label>
              <input type="number" value={productForm.price} onChange={e => {
                setProductForm({...productForm, price: e.target.value});
                if (errors.price) setErrors({...errors, price: undefined});
              }} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'}`} placeholder="1299" />
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Variant Images (Optional)</label>
                    <input type="file" accept="image/*" multiple onChange={e => {
                        const files = Array.from(e.target.files || []);
                        const newVariants = [...variants];
                        newVariants[index].imageFiles = files;
                        setVariants(newVariants);
                    }} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md mb-2" />
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`apply-${index}`} checked={v.applyImagesToSameColor || false} onChange={e => {
                        const newVariants = [...variants];
                        newVariants[index].applyImagesToSameColor = e.target.checked;
                        setVariants(newVariants);
                      }} className="w-3.5 h-3.5 text-primary border-gray-300 rounded focus:ring-primary" />
                      <label htmlFor={`apply-${index}`} className="text-xs text-gray-700 cursor-pointer">Apply these images to all {v.color || 'this color'} variants</label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-700">Size Inventory</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newVariants = [...variants];
                      newVariants[index].sizes.push({ size: '' });
                      setVariants(newVariants);
                    }}
                    className="text-xs text-primary font-medium hover:underline flex items-center"
                  >
                    <Plus size={12} className="mr-1" /> Add Size
                  </button>
                </div>
                {sizeOptions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-[11px] text-gray-500 mr-1">Quick add:</span>
                    {sizeOptions.map(opt => {
                      const alreadyUsed = v.sizes.some(s => s.size.trim().toLowerCase() === opt.toLowerCase());
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={alreadyUsed}
                          onClick={() => {
                            const newVariants = [...variants];
                            const sizes = newVariants[index].sizes;
                            const emptyIdx = sizes.findIndex(s => !s.size);
                            if (emptyIdx >= 0) {
                              sizes[emptyIdx] = { size: opt };
                            } else {
                              sizes.push({ size: opt });
                            }
                            setVariants(newVariants);
                          }}
                          className={`px-2 py-1 text-[11px] rounded border transition-colors ${alreadyUsed ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-2">
                  {v.sizes.map((s, sIndex) => (
                    <div key={sIndex} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={s.size} 
                        onChange={e => {
                          const newVariants = [...variants];
                          newVariants[index].sizes[sIndex].size = e.target.value;
                          setVariants(newVariants);
                        }} 
                        placeholder="Size (e.g. M, 42)" 
                        className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-primary" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = [...variants];
                          newVariants[index].sizes.splice(sIndex, 1);
                          setVariants(newVariants);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors bg-white border border-transparent hover:border-red-200"
                        title="Remove Size"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setVariants([...variants, { color: '', images: '', imageFiles: [], applyImagesToSameColor: false, sizes: [{ size: '' }] }])} className="mt-2 text-xs text-[#e35a39] font-medium hover:underline flex items-center">
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
