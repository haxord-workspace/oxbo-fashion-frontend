import React, { useState } from 'react';
import { Download, Upload, FileType, CheckCircle, X, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminProductApi } from '../../services/admin/adminProduct.Api';
import { adminCategoriesApi } from '../../services/admin/admincategories.Api';
import { adminBrandApi } from '../../services/admin/adminBrand.Api';

export const AdminBulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [subCategoriesMap, setSubCategoriesMap] = useState<Record<string, any[]>>({});
  const [loadingSubCategory, setLoadingSubCategory] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsFetchingData(true);
    setIsCategoryModalOpen(true);
    setExpandedCategoryId(null);
    try {
      const response = await adminCategoriesApi.getRootCategories();
      const roots = response.categories || (response as any).data || [];
      setCategories(roots);
      
      // Prefetch subcategories to show indicator
      const subMap: Record<string, any[]> = {};
      await Promise.all(roots.map(async (c: any) => {
        const cId = c._id || c.id;
        try {
          const subRes = await adminCategoriesApi.getCategoryChildren(cId);
          subMap[cId] = subRes.categories || [];
        } catch {
          subMap[cId] = [];
        }
      }));
      setSubCategoriesMap(subMap);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch categories');
      setIsCategoryModalOpen(false);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleCategoryClick = async (categoryId: string) => {
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
      return;
    }
    
    setExpandedCategoryId(categoryId);
    
    if (!subCategoriesMap[categoryId]) {
      setLoadingSubCategory(categoryId);
      try {
        const response = await adminCategoriesApi.getCategoryChildren(categoryId);
        setSubCategoriesMap(prev => ({ ...prev, [categoryId]: response.categories || [] }));
      } catch (error) {
        console.error("Failed to fetch subcategories", error);
      } finally {
        setLoadingSubCategory(null);
      }
    }
  };

  const fetchBrands = async () => {
    setIsFetchingData(true);
    setIsBrandModalOpen(true);
    try {
      const response = await adminBrandApi.getBrands({ limit: 1000 });
      setBrands(response.brands || (response as any).data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch brands');
      setIsBrandModalOpen(false);
    } finally {
      setIsFetchingData(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await adminProductApi.getBulkUploadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_bulk_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await adminProductApi.uploadBulkProducts(formData);
      toast.success(response.message || 'Products uploaded successfully');
      setFile(null); // Reset after successful upload
      // Optionally reset the file input field
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload products');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Products</h2>
          <p className="mt-1 text-sm text-gray-500">
            Download the template, fill in your product data, and upload the CSV file.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchCategories}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Show Categories
          </button>
          <button
            onClick={fetchBrands}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Show Brands
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Download size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Step 1: Download Template</h3>
              <p className="text-sm text-gray-500">Get the required CSV format</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Required Columns:</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>name</li>
              <li>description & shortDescription</li>
              <li>categoryId & brandId (Use valid IDs)</li>
              <li>thumbnail & gallery (Valid URLs)</li>
              <li>price, sku, status</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-primary text-primary px-4 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 font-medium"
          >
            <Download size={20} />
            <span>{isDownloading ? 'Downloading...' : 'Download CSV Template'}</span>
          </button>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Step 2: Upload Data</h3>
              <p className="text-sm text-gray-500">Upload your completed CSV file</p>
            </div>
          </div>

          <div className="mb-6">
            <label 
              htmlFor="csv-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                file ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                  </>
                ) : (
                  <>
                    <FileType className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-medium">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </>
                )}
              </div>
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Upload size={20} />
            <span>{isUploading ? 'Uploading...' : 'Upload Products'}</span>
          </button>
        </div>
      </div>

      {/* Categories Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {isFetchingData ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((c: any) => {
                    const cId = c._id || c.id;
                    const isExpanded = expandedCategoryId === cId;
                    const cSubCategories = subCategoriesMap[cId] || [];
                    const hasLoaded = subCategoriesMap[cId] !== undefined;

                    return (
                      <div key={cId} className="space-y-2">
                        <div 
                          onClick={() => handleCategoryClick(cId)}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            {c.name}
                            {hasLoaded && (
                               cSubCategories.length > 0 
                               ? <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">Has Subcategories</span>
                               : <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full whitespace-nowrap">No Subcategories</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <code className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{cId}</code>
                            <button onClick={() => copyToClipboard(cId)} className="text-gray-400 hover:text-primary transition-colors" title="Copy ID">
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="pl-4 ml-2 border-l-2 border-gray-100 space-y-2">
                            {loadingSubCategory === cId ? (
                              <div className="flex justify-center py-2">
                                <Loader2 className="animate-spin text-gray-400" size={16} />
                              </div>
                            ) : cSubCategories.length > 0 ? (
                              cSubCategories.map((sc: any) => {
                                const scId = sc._id || sc.id;
                                return (
                                  <div key={scId} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                                    <span className="text-sm font-medium text-gray-600 flex items-center">
                                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                                      {sc.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">{scId}</code>
                                      <button onClick={() => copyToClipboard(scId)} className="text-gray-400 hover:text-primary transition-colors" title="Copy ID">
                                        <Copy size={14} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            ) : hasLoaded ? (
                              <div className="text-sm text-gray-500 bg-gray-50/50 p-3 rounded-lg border border-gray-100 text-center">No subcategories found for this category.</div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {categories.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No categories found.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Brands Modal */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Brands</h3>
              <button onClick={() => setIsBrandModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {isFetchingData ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {brands.map((b: any) => (
                    <div key={b._id || b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{b.name}</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{b._id || b.id}</code>
                        <button onClick={() => copyToClipboard(b._id || b.id)} className="text-gray-400 hover:text-primary transition-colors" title="Copy ID">
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {brands.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No brands found.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
