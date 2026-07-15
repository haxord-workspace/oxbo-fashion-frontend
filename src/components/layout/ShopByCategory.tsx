import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'c1',
    name: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    path: '/category/t-shirts'
  },
  {
    id: 'c2',
    name: 'Jeans',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    path: '/category/jeans'
  },
  {
    id: 'c3',
    name: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    path: '/category/outerwear'
  },
  {
    id: 'c4',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    path: '/category/accessories'
  }
];

const ShopByCategory: React.FC = () => {
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
              Shop by <span className="text-[#e35a39]">Category</span>
            </h2>
            <p className="text-gray-500 mt-2">Explore our curated collections for your perfect style.</p>
          </div>
          <Link to="/products" className="hidden md:inline-flex items-center text-sm font-medium hover:text-[#e35a39] transition-colors border-b border-black pb-1 hover:border-[#e35a39]">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={category.path}
              className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-gray-100 block"
            >
              <img 
                src={category.image} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4 md:p-6 w-full">
                <h3 className="text-white text-xl md:text-2xl font-bold translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {category.name}
                </h3>
                <p className="text-white/80 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Explore Collection &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
