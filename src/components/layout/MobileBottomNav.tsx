import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleCart } from '../../features/ui/uiSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

const MobileBottomNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const cartCount = useAppSelector(selectCartCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 pt-1.5 pb-1 flex justify-between items-center pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <Link to="/" className={`flex flex-col items-center px-1 ${isActive('/') ? 'text-black' : 'text-gray-500'}`}>
        <Home className="w-5 h-5 mb-0.5" strokeWidth={isActive('/') ? 2 : 1.5} />
        <span className="text-[9px] font-bold">HOME</span>
      </Link>
      
      <Link to="/collections/all-drops" className={`flex flex-col items-center px-1 ${isActive('/shop') ? 'text-black' : 'text-gray-500'}`}>
        <LayoutGrid className="w-5 h-5 mb-0.5" strokeWidth={isActive('/shop') ? 2 : 1.5} />
        <span className="text-[9px] font-bold">SHOP</span>
      </Link>

      <button 
        onClick={() => dispatch(toggleCart())}
        className="flex flex-col items-center px-1 relative text-gray-500 hover:text-black transition-colors"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-0.5" strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold">CART</span>
      </button>

      <Link 
        to={isAuthenticated ? "/profile" : "/login"} 
        className={`flex flex-col items-center px-1 ${isActive('/profile') || isActive('/login') ? 'text-black' : 'text-gray-500'}`}
      >
        <User className="w-5 h-5 mb-0.5" strokeWidth={isActive('/profile') || isActive('/login') ? 2 : 1.5} />
        <span className="text-[9px] font-bold">ACCOUNT</span>
      </Link>
    </div>
  );
};

export default MobileBottomNav;
