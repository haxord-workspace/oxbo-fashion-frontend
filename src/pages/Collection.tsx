import React from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/layout/ProductGrid';

const Collection: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const getFormattedTitle = (id: string | undefined) => {
    if (!id) return 'COLLECTION';
    if (id === 'flash-sale') return 'FLASH SALE ⚡';
    return id.replace(/-/g, ' ').toUpperCase();
  };

  const title = getFormattedTitle(categoryId);

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black italic" style={{ fontFamily: 'Impact, sans-serif' }}>
            {title}
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-widest font-semibold">
            {categoryId === 'flash-sale' 
              ? 'Limited time offers. Grab them before they are gone.' 
              : 'Explore our latest drops and premium collections.'}
          </p>
        </div>
        
        <ProductGrid />
      </div>
    </div>
  );
};

export default Collection;
