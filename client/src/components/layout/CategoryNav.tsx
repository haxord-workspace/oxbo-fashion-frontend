import React from 'react';
import { NavLink } from 'react-router-dom';

const categories = [
  { name: 'HOME', path: '/' },
  { name: 'FLASH SALE ⚡', path: '/collections/flash-sale' },
  { name: 'NEW DROPS', path: '/collections/new-drops' },
  { name: 'ALL DROPS', path: '/collections/all-drops' },
  { name: 'DENIMS', path: '/collections/denims' },
  { name: 'BAGGY', path: '/collections/baggy' },
  { name: 'BOOTCUT', path: '/collections/bootcut' },
  { name: 'STRAIGHT', path: '/collections/straight' },
  { name: 'WIDE', path: '/collections/wide' },
  { name: 'TOPS', path: '/collections/tops' },
  { name: 'ACCESSORIES', path: '/collections/accessories' },
  { name: 'BRACELET', path: '/collections/bracelet' },
  { name: 'JEAN CHAINS', path: '/collections/jean-chains' },
  { name: 'BELTS', path: '/collections/belts' },
];

const CategoryNav: React.FC = () => {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 overflow-x-auto no-scrollbar">
        <ul className="flex items-center justify-center space-x-6 sm:space-x-10 min-w-max py-3 sm:py-4">
          {categories.map((category) => (
            <li key={category.name}>
              <NavLink
                to={category.path}
                className={({ isActive }) =>
                  `text-[10px] sm:text-xs tracking-widest font-semibold uppercase transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'text-black border-b border-black pb-1' 
                      : 'text-gray-500 hover:text-black'
                  }`
                }
              >
                {category.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
