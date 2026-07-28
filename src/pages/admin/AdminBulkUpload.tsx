import React, { useState } from 'react';
import { Download, Upload, FileType, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminProductApi } from '../../services/admin/adminProduct.Api';

export const AdminBulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Products</h2>
        <p className="mt-1 text-sm text-gray-500">
          Download the template, fill in your product data, and upload the CSV file.
        </p>
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
    </div>
  );
};
