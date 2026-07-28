import React, { useEffect } from 'react';
import { X, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleMobileMenu } from '../../features/ui/uiSlice';

const MobileMenuDrawer: React.FC = () => {
  const isOpen = useAppSelector(state => state.ui.isMobileMenuOpen);
  const dispatch = useAppDispatch();

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const closeMenu = () => {
    if (isOpen) {
      dispatch(toggleMobileMenu());
    }
  };

  const menuItems = [
    { label: 'HOME', to: '/' },
    { label: 'FLASH SALE ⚡', to: '/collections/flash-sale' },
    { label: 'SHOP ALL', to: '/collections/shop-all' },
    { label: 'DENIMS', to: '/collections/denims', hasSubmenu: true },
    { label: 'NEW DROPS', to: '/collections/new-drops' },
    { label: 'ACCESSORIES', to: '/collections/accessories', hasSubmenu: true },
    { label: 'TOPS', to: '/collections/tops' },
    { label: 'CONTACT', to: '/contact' },
    {label:'Wishlist', to:'/wishlist'},
    { label: 'Orders', to: '/orders' },
    { label: 'Notification', to: '/notifications' }

  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-primary/50 backdrop-blur-sm transition-opacity duration-300 z-50 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={closeMenu}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[400px] bg-[#1a1a1a]/60 backdrop-blur-2xl border-r border-white/10 text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header - Close Button */}
        <div className="p-4 pt-6">
          <button
            onClick={closeMenu}
            className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shadow-sm"
            aria-label="Close menu"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <nav className="flex flex-col space-y-6">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                onClick={closeMenu}
                className="text-[15px] font-medium tracking-wide flex items-center justify-between text-gray-300 hover:text-white transition-colors"
              >
                <span>{item.label}</span>
                {item.hasSubmenu && <ChevronRight size={18} className="text-gray-400" />}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer - My Account */}
        <div className="p-6 border-t border-white/10">
          <Link
            to="/login"
            onClick={closeMenu}
            className="flex items-center gap-3 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            <User size={20} strokeWidth={1.5} />
            My Account
          </Link>
        </div>
      </div>
    </>
  );
};

export default MobileMenuDrawer;
