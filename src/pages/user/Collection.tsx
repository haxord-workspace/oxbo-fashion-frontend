import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Filter, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import InfiniteProductGrid from '../../components/layout/InfiniteProductGrid';
import api from '../../services/api';

const Collection: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<'all' | 'brand' | 'color' | 'sort' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('Sort by: Featured');
  const [appliedFiltersState, setAppliedFiltersState] = useState({
    category: '',
    brand: '',
    color: '',
    maxPrice: 5000,
    sortOption: 'Sort by: Featured'
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<{_id: string, name: string}[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderCategories = (cats: any[], depth = 0) => {
    if (!Array.isArray(cats)) return null;
    return cats.map((cat) => {
      const catId = cat._id || cat.id;
      const isExpanded = expandedCategories[catId] || selectedCategory === catId;
      return (
        <li key={catId} className="w-full">
          <div 
            onClick={(e) => handleCategoryClick(catId, e)}
            className={`cursor-pointer hover:pl-1 transition-all duration-200 flex justify-between items-center ${selectedCategory === catId ? 'text-primary font-bold' : 'hover:text-primary'} ${depth > 0 ? 'mt-2 text-[13px]' : ''}`}
            style={{ paddingLeft: `${depth * 12}px` }}
          >
            <span>{cat.name}</span>
            {cat.children && cat.children.length > 0 && (
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </div>
          {isExpanded && cat.children && cat.children.length > 0 && (
            <ul className="mt-2 space-y-2 border-l border-gray-100 ml-2 pl-2">
              {renderCategories(cat.children, depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  };


  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedCategory('');
    setAppliedFiltersState(prev => ({ ...prev, category: '' }));
  }, [categoryId, categoryQuery, searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories/tree').catch(() => null),
          api.get('/brands').catch(() => null)
        ]);

        if (catRes) {
          const catData = catRes.data?.data?.categories || catRes.data?.data || catRes.data;
          if (Array.isArray(catData)) setCategories(catData);
        }
        
        if (brandRes) {
          const brandData = brandRes.data?.data?.brands || brandRes.data?.brands || brandRes.data?.data || brandRes.data;
          if (Array.isArray(brandData)) setBrands(brandData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);



  const currentFilters = useMemo(() => {
    let filters: any = {};

    const findCategoryDepth = (cats: any[], id: string, depth = 0): number | null => {
      for (const cat of cats) {
        if ((cat._id === id) || (cat.id === id)) return depth;
        if (cat.children && cat.children.length > 0) {
          const childDepth = findCategoryDepth(cat.children, id, depth + 1);
          if (childDepth !== null) return childDepth;
        }
      }
      return null;
    };

    const getDescendantIds = (cat: any): string[] => {
      let ids: string[] = [];
      const id = cat._id || cat.id;
      if (id) ids.push(String(id));
      
      if (cat.children) {
        cat.children.forEach((c: any) => {
          ids = ids.concat(getDescendantIds(c));
        });
      }
      return ids;
    };

    const findCatAndGetIds = (cats: any[], targetId: string): string[] => {
      for (const cat of cats) {
        if ((cat._id === targetId) || (cat.id === targetId)) {
          return getDescendantIds(cat);
        }
        if (cat.children) {
          const found = findCatAndGetIds(cat.children, targetId);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    const findCatInTree = (cats: any[], target: string): any => {
      if (!Array.isArray(cats)) return null;
      for (const cat of cats) {
        const id = String(cat._id || cat.id || '');
        const slug = String(cat.slug || '').toLowerCase();
        const nameSlug = String(cat.name || '').toLowerCase().replace(/\s+/g, '-');
        const name = String(cat.name || '').toLowerCase();
        const t = target.toLowerCase();

        if (id === target || slug === t || nameSlug === t || name === t) {
          return cat;
        }
        if (cat.children && cat.children.length > 0) {
          const found = findCatInTree(cat.children, target);
          if (found) return found;
        }
      }
      return null;
    };

    if (categoryId === 'flash-sale') {
      filters = { flashSale: true };
    } else if (categoryId === 'new-drops') {
      filters = { sort: 'createdAt', order: 'desc', limit: 20 };
    } else if (categoryId === 'all-drops') {
      filters = {};
    } else if (categoryId || categoryQuery) {
      const lookupKey = categoryQuery || categoryId || '';
      const matchedCat = findCatInTree(categories, lookupKey) || (categoryId ? findCatInTree(categories, categoryId) : null);
      const effectiveId = categoryQuery || (matchedCat ? (matchedCat._id || matchedCat.id) : categoryId);

      const depth = effectiveId ? findCategoryDepth(categories, effectiveId) : null;
      if (depth === 1) {
        filters.subCategory = effectiveId;
      } else if (depth === 2) {
        filters.nestedSubCategory = effectiveId;
      } else {
        filters.category = effectiveId;
      }

      if (!selectedCategory && effectiveId) {
        const ids = findCatAndGetIds(categories, effectiveId);
        if (ids.length > 0) {
          filters.validCategoryIds = ids;
        } else {
          filters.validCategoryIds = [String(effectiveId)];
        }
      }
    }

    if (searchQuery) filters.search = searchQuery;
    if (appliedFiltersState.category) {
      const depth = findCategoryDepth(categories, appliedFiltersState.category);
      if (depth === 1) {
        filters.subCategory = appliedFiltersState.category;
      } else if (depth === 2) {
        filters.nestedSubCategory = appliedFiltersState.category;
      } else {
        filters.category = appliedFiltersState.category;
      }
      filters.validCategoryIds = findCatAndGetIds(categories, appliedFiltersState.category);
    }
    if (appliedFiltersState.brand) filters.brand = appliedFiltersState.brand;
    if (appliedFiltersState.maxPrice < 5000) filters.maxPrice = appliedFiltersState.maxPrice;
    if (appliedFiltersState.color) {
      filters.color = appliedFiltersState.color;
      filters.search = filters.search 
        ? `${filters.search} ${appliedFiltersState.color}` 
        : appliedFiltersState.color;
    }

    if (appliedFiltersState.sortOption === 'Price: Low to High') {
      filters.sort = 'price';
      filters.order = 'asc';
    } else if (appliedFiltersState.sortOption === 'Price: High to Low') {
      filters.sort = 'price';
      filters.order = 'desc';
    } else if (appliedFiltersState.sortOption === 'Newest Arrivals') {
      filters.sort = 'createdAt';
      filters.order = 'desc';
    }
    return filters;
  }, [categoryId, categoryQuery, searchQuery, appliedFiltersState, categories]);

  return (
    <div className="flex-1 bg-white min-h-screen">
   
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 pt-0 pb-8 md:pt-4 md:pb-12">
       
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
                  {(activeFilterSection === 'all' || activeFilterSection === 'sort') && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Sort By
                      </h3>
                      <ul className="space-y-3">
                        {['Sort by: Featured', 'Price: Low to High', 'Price: High to Low', 'Newest Arrivals'].map((option) => (
                          <li key={option}>
                            <button
                              onClick={() => {
                                setSortOption(option);
                                if (activeFilterSection === 'sort') {
                                  setAppliedFiltersState(prev => ({ ...prev, sortOption: option }));
                                  setIsFilterOpen(false);
                                }
                              }}
                              className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                                sortOption === option
                                  ? 'bg-primary text-white border border-primary'
                                  : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(activeFilterSection === 'all' || activeFilterSection === 'category') && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Categories
                      </h3>
                      <ul className="space-y-3 text-sm text-gray-600">
                        {renderCategories(categories)}
                      </ul>
                    </div>
                  )}

                  {(activeFilterSection === 'all' || activeFilterSection === 'brand') && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Brands
                      </h3>
                      <ul className="space-y-3 text-sm text-gray-600 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {brands.map((brand) => (
                          <li
                            key={brand._id}
                            onClick={() => {
                              const newVal = selectedBrand === brand._id ? '' : brand._id;
                              setSelectedBrand(newVal);
                              if (activeFilterSection === 'brand') {
                                setAppliedFiltersState(prev => ({ ...prev, brand: newVal }));
                                setIsFilterOpen(false);
                              }
                            }}
                            className={`cursor-pointer hover:pl-1 transition-all duration-200 ${selectedBrand === brand._id ? 'text-primary font-bold' : 'hover:text-primary'}`}
                          >
                            {brand.name}
                          </li>
                        ))}
                        {brands.length === 0 && (
                          <li className="text-gray-400 italic">No brands available</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {(activeFilterSection === 'all') && (
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
                  )}

                  {(activeFilterSection === 'all' || activeFilterSection === 'color') && (
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
                            onClick={() => {
                              const newVal = selectedColor === c.name.toLowerCase() ? '' : c.name.toLowerCase();
                              setSelectedColor(newVal);
                              if (activeFilterSection === 'color') {
                                setAppliedFiltersState(prev => ({ ...prev, color: newVal }));
                                setIsFilterOpen(false);
                              }
                            }}
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
                  )}


                </div>

                {(activeFilterSection === 'all' || activeFilterSection === 'category') && (
                  <div className="mt-auto border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0 z-20">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setSelectedBrand('');
                        setMaxPrice(5000);
                        setSelectedColor('');
                        setSortOption('Sort by: Featured');
                        setAppliedFiltersState({
                          category: '',
                          brand: '',
                          color: '',
                          maxPrice: 5000,
                          sortOption: 'Sort by: Featured'
                        });
                      }}
                      className="w-full bg-white text-gray-900 border border-gray-300 font-bold uppercase tracking-widest py-3 text-sm hover:bg-gray-50 transition-colors mb-3"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => {
                        setAppliedFiltersState({
                          category: selectedCategory,
                          brand: selectedBrand,
                          color: selectedColor,
                          maxPrice,
                          sortOption
                        });
                        setIsFilterOpen(false);
                      }}
                      className="w-full bg-primary text-white font-bold uppercase tracking-widest py-4 text-sm hover:bg-gray-900 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}

              </aside>
            </>
          )}

          {/* Product Grid Area */}
          <div className="flex-1 transition-all duration-300 relative">
            <div className="sticky top-14 bg-white z-30 shadow-sm sm:shadow-sm -mx-4 sm:mx-0 mb-4 sm:mb-6">
              <div className="w-full px-4 py-3 border-b border-gray-100 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 min-w-max">
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors bg-white font-medium"
                    onClick={() => { setActiveFilterSection('all'); setIsFilterOpen(true); }}
                  >
                    <SlidersHorizontal size={16} />
                    Sort & Filter
                  </button>
                  
                  {/* Keep the sort functionality intact but style it like the pills */}
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors bg-white font-medium"
                    onClick={() => { setActiveFilterSection('sort'); setIsFilterOpen(true); }}
                  >
                    {sortOption} <ChevronDown size={16} />
                  </button>

                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors bg-white font-medium"
                    onClick={() => { setActiveFilterSection('brand'); setIsFilterOpen(true); }}
                  >
                    Brand <ChevronDown size={16} />
                  </button>
                  
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors bg-white font-medium"
                    onClick={() => { setActiveFilterSection('color'); setIsFilterOpen(true); }}
                  >
                    Color <ChevronDown size={16} />
                  </button>
                  
                  <button 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors bg-white font-medium"
                    onClick={() => { setActiveFilterSection('category'); setIsFilterOpen(true); }}
                  >
                    Category <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
            <InfiniteProductGrid filters={currentFilters} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
