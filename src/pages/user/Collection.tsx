import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import ProductGrid from '../../components/layout/ProductGrid';
import BannerDisplay from '../../components/layout/BannerDisplay';

const Collection: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getFormattedTitle = (id: string | undefined) => {
    if (!id) return 'COLLECTION';
    if (id === 'flash-sale') return 'FLASH SALE ⚡';
    return id.replace(/-/g, ' ').toUpperCase();
  };

  const title = getFormattedTitle(categoryId);

  let currentFilters: any = {};
  if (categoryId === 'flash-sale') {
    currentFilters = { tag: 'flash-sale' };
  } else if (categoryId === 'new-drops') {
    currentFilters = { sort: 'createdAt', order: 'desc', limit: 20 };
  } else if (categoryId === 'all-drops') {
    currentFilters = {};
  } else if (categoryQuery) {
    currentFilters = { category: categoryQuery };
  }

  return (
    <div className="flex-1 bg-white min-h-screen">
      <BannerDisplay position="category_top" />
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-primary italic" style={{ fontFamily: 'Impact, sans-serif' }}>
            {title}
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-widest font-semibold">
            {categoryId === 'flash-sale'
              ? 'Limited time offers. Grab them before they are gone.'
              : 'Explore our latest drops and premium collections.'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {/* Filters Modal Overlay */}
          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-primary bg-opacity-50 z-[60] transition-opacity"
                onClick={() => setIsFilterOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer */}
              <aside className="fixed inset-y-0 left-0 z-[70] w-full max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-fade-in overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center uppercase tracking-widest">
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 -mr-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <span className="sr-only">Close filters</span>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-10">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Categories
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      {['T-Shirts', 'Jeans', 'Outerwear', 'Accessories'].map((cat) => (
                        <li
                          key={cat}
                          className="cursor-pointer hover:text-primary hover:pl-1 transition-all duration-200"
                        >
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Price Range
                    </h3>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                                 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform
                                 [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                      <span>Rs. 0</span>
                      <span>Rs. 5,000+</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Color
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {['bg-primary', 'bg-white border border-gray-300', 'bg-blue-500', 'bg-red-500', 'bg-green-500'].map((colorClass, idx) => (
                        <button
                          key={idx}
                          className={`w-7 h-7 rounded-full ${colorClass} ring-offset-2 hover:ring-2 hover:ring-primary
                                     hover:scale-110 active:scale-95 transition-all duration-200`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['28', '30', '32', '34', 'S', 'M', 'L', 'XL'].map((size) => (
                        <button
                          key={size}
                          className="border border-gray-300 w-10 h-10 text-xs font-medium rounded-sm
                                     hover:border-primary hover:bg-primary hover:text-white
                                     active:scale-95 transition-all duration-200"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full bg-primary text-white font-bold uppercase tracking-widest py-4 text-sm hover:bg-gray-900 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </aside>
            </>
          )}

          {/* Product Grid Area */}
          <div className="flex-1 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm px-4 py-2 bg-white text-primary border border-gray-200 hover:border-primary transition-colors"
                >
                  <Filter size={16} /> Filters
                </button>
                <span className="text-sm text-gray-500">Showing 16 products</span>
              </div>

              <select className="border border-gray-200 text-sm px-4 py-2 bg-white focus:outline-none focus:border-primary cursor-pointer rounded-none">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
            <ProductGrid filters={currentFilters} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
