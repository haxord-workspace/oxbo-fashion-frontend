import React from 'react';
import { NavLink } from 'react-router-dom';

const CategoryNav: React.FC = () => {
  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'FLASH SALE ⚡', path: '/collections/flash-sale' },
    { name: 'NEW DROPS', path: '/collections/new-drops' },
    { name: 'ALL DROPS', path: '/collections/all-drops' },
    { name: 'BELTS', path: '/collections/belts' },
    { name: 'JEAN CHAINS', path: '/collections/jean-chains' },
    { name: 'BRACELET', path: '/collections/bracelet' },
    { name: 'ACCESSORIES', path: '/collections/accessories' },
    { name: 'TOPS', path: '/collections/tops' },
    { name: 'WIDE', path: '/collections/wide' },
    { name: 'STRAIGHT', path: '/collections/straight' },
    { name: 'BOOTCUT', path: '/collections/bootcut' },
    { name: 'BAGGY', path: '/collections/baggy' },
    { name: 'DENIMS', path: '/collections/denims' },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 overflow-x-auto no-scrollbar">
        <ul className="flex items-center justify-center space-x-6 sm:space-x-10 min-w-max py-3 sm:py-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `text-[10px] sm:text-xs tracking-widest font-semibold uppercase transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'text-primary border-b border-primary pb-1' 
                      : 'text-gray-500 hover:text-primary'
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
