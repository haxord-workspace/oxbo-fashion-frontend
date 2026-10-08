import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import api from '../../services/api';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

const staticNavItems = [
  { name: 'HOME', path: '/' },
  { name: 'FLASH SALE ⚡', path: '/collections/flash-sale' },
  { name: 'NEW DROPS', path: '/collections/new-drops' },
  { name: 'ALL DROPS', path: '/collections/all-drops' },
];

const CategoryNav: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories?limit=100');
        const data = response.data?.data?.categories || response.data?.categories || response.data?.data || response.data;
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStartX.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !isDragging.current) return;
    el.scrollLeft = scrollStartX.current - (e.clientX - dragStartX.current);
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  const categoryNavItems = categories.map((category) => ({
    name: category.name.toUpperCase(),
    path: `/collections/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}?category=${category._id}`,
  }));

  const navItems = [...staticNavItems, ...categoryNavItems];

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div
        ref={scrollRef}
        className="max-w-[1920px] mx-auto px-4 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
        onWheel={handleWheel}
      >
        <ul className="flex items-center space-x-6 sm:space-x-10 min-w-max py-3 sm:py-4">
          {navItems.map((item) => (
            <li key={item.name} className={item.name === 'HOME' ? 'hidden sm:block' : ''}>
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
