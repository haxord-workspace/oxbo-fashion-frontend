import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import InfiniteProductGrid from '../../components/layout/InfiniteProductGrid';
import BannerDisplay from '../../components/layout/BannerDisplay';
import api from '../../services/api';

const Collection: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('Sort by: Featured');
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const data = response.data?.data?.categories || response.data?.data || response.data;
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const getFormattedTitle = (id: string | undefined) => {
    if (!id) return 'COLLECTION';
    if (id === 'flash-sale') return 'FLASH SALE ⚡';
    return id.replace(/-/g, ' ').toUpperCase();
  };

  const title = getFormattedTitle(categoryId);

  const currentFilters = useMemo(() => {
    let filters: any = {};
    if (categoryId === 'flash-sale') {
      filters = { flashSale: true };
    } else if (categoryId === 'new-drops') {
      filters = { sort: 'createdAt', order: 'desc', limit: 20 };
    } else if (categoryId === 'all-drops') {
      filters = {};
    } else if (categoryQuery) {
      filters = { category: categoryQuery };
    }

    if (selectedCategory) filters.category = selectedCategory;
    if (maxPrice < 5000) filters.maxPrice = maxPrice;
    if (selectedColor) filters.color = selectedColor;
    if (selectedSize) filters.size = selectedSize;

    if (sortOption === 'Price: Low to High') {
      filters.sort = 'price';
      filters.order = 'asc';
    } else if (sortOption === 'Price: High to Low') {
      filters.sort = 'price';
      filters.order = 'desc';
    } else if (sortOption === 'Newest Arrivals') {
      filters.sort = 'createdAt';
      filters.order = 'desc';
    }
    return filters;
  }, [categoryId, categoryQuery, selectedCategory, maxPrice, selectedColor, selectedSize, sortOption]);

  // Reset count to null (shows "Loading...") whenever filters change
  useEffect(() => {
    setProductCount(null);
  }, [currentFilters]);

  return (
    <div className="flex-1 bg-white min-h-screen">
      <BannerDisplay position="Category Top" />
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
                      {categories.map((cat) => (
                        <li
                          key={cat._id}
                          onClick={() => setSelectedCategory(selectedCategory === cat._id ? '' : cat._id)}
                          className={`cursor-pointer hover:pl-1 transition-all duration-200 ${selectedCategory === cat._id ? 'text-primary font-bold' : 'hover:text-primary'}`}
                        >
                          {cat.name}
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
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
                                 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform
                                 [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                      <span>Rs. 0</span>
                      <span>Rs. {maxPrice}{maxPrice === 5000 ? '+' : ''}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Color
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {[
                        { name: 'Black', class: 'bg-black' },
                        { name: 'White', class: 'bg-white border border-gray-300' },
                        { name: 'Gray', class: 'bg-gray-500' },
                        { name: 'Red', class: 'bg-red-500' },
                        { name: 'Blue', class: 'bg-blue-500' },
                        { name: 'Green', class: 'bg-green-500' },
                        { name: 'Yellow', class: 'bg-yellow-400' },
                        { name: 'Orange', class: 'bg-orange-500' },
                        { name: 'Pink', class: 'bg-pink-500' },
                        { name: 'Purple', class: 'bg-purple-500' },
                        { name: 'Brown', class: 'bg-amber-800' }
                      ].map((c) => (
                        <button
                          key={c.name}
                          title={c.name}
                          onClick={() => setSelectedColor(selectedColor === c.name.toLowerCase() ? '' : c.name.toLowerCase())}
                          className={`w-7 h-7 rounded-full ${c.class} ring-offset-2 hover:ring-2 hover:ring-primary
                                     hover:scale-110 active:scale-95 transition-all duration-200 ${selectedColor === c.name.toLowerCase() ? 'ring-2 ring-primary scale-110' : ''}`}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or type a color name..."
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value.toLowerCase())}
                      className="w-full border border-gray-200 text-sm px-4 py-2 focus:outline-none focus:border-primary rounded-none"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['28', '30', '32', '34', 'S', 'M', 'L', 'XL'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                          className={`border border-gray-300 w-10 h-10 text-xs font-medium rounded-sm
                                     hover:border-primary hover:bg-primary hover:text-white
                                     active:scale-95 transition-all duration-200 ${selectedSize === size ? 'bg-primary text-white border-primary' : ''}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setMaxPrice(5000);
                      setSelectedColor('');
                      setSelectedSize('');
                    }}
                    className="w-full bg-white text-gray-900 border border-gray-300 font-bold uppercase tracking-widest py-3 text-sm hover:bg-gray-50 transition-colors mb-3"
                  >
                    Clear Filters
                  </button>
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
          <div className="flex-1 transition-all duration-300 relative">
            <div className="sticky top-20 bg-white z-30 shadow-sm -mx-4 sm:mx-0 mb-6">
              {/* Mobile View */}
              <div className="flex sm:hidden w-full border-b border-gray-200 text-gray-700">
                <button 
                  className="flex-1 flex items-center justify-center py-3 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter size={16} className="mr-2" />
                  <span className="font-bold text-sm tracking-wide uppercase">Filter</span>
                </button>
              </div>

              {/* Desktop View */}
              <div className="hidden sm:flex justify-between items-center py-4 px-4 sm:px-2 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm px-4 py-2 bg-white text-primary border border-gray-200 hover:border-primary transition-colors"
                  >
                    <Filter size={16} /> Filters
                  </button>
                  <span className="text-sm text-gray-500">
                    {productCount === null ? 'Loading...' : `Showing ${productCount} product${productCount !== 1 ? 's' : ''}`}
                  </span>
                </div>

                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-gray-200 text-sm px-4 py-2 bg-white focus:outline-none focus:border-primary cursor-pointer rounded-none"
                >
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
            </div>
            <InfiniteProductGrid filters={currentFilters} onProductCount={setProductCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
