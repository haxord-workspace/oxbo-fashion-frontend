import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories');
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

  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'FLASH SALE ⚡', path: '/collections/flash-sale' },
    { name: 'NEW DROPS', path: '/collections/new-drops' },
    { name: 'ALL DROPS', path: '/collections/all-drops' },
    ...categories.map(c => ({
      name: c.name,
      path: `/collections/${c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}?category=${c._id}`
    }))
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
