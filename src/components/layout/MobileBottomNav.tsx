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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-primary border-t border-primary-dark z-50 px-6 py-2 flex justify-between items-center pb-safe">
      <Link to="/" className={`flex flex-col items-center p-1 ${isActive('/') ? 'text-white' : 'text-white/60'}`}>
        <Home className="w-6 h-6 mb-1" strokeWidth={isActive('/') ? 2 : 1.5} />
        <span className="text-[10px] font-bold">HOME</span>
      </Link>
      
      <Link to="/collections/all-drops" className={`flex flex-col items-center p-1 ${isActive('/shop') ? 'text-white' : 'text-white/60'}`}>
        <LayoutGrid className="w-6 h-6 mb-1" strokeWidth={isActive('/shop') ? 2 : 1.5} />
        <span className="text-[10px] font-bold">SHOP</span>
      </Link>

      <button 
        onClick={() => dispatch(toggleCart())}
        className="flex flex-col items-center p-1 relative text-white/60"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6 mb-1" strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-white text-primary text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">CART</span>
      </button>

      <Link 
        to={isAuthenticated ? "/profile" : "/login"} 
        className={`flex flex-col items-center p-1 ${isActive('/profile') || isActive('/login') ? 'text-white' : 'text-white/60'}`}
      >
        <User className="w-6 h-6 mb-1" strokeWidth={isActive('/profile') || isActive('/login') ? 2 : 1.5} />
        <span className="text-[10px] font-bold">ACCOUNT</span>
      </Link>
    </div>
  );
};

export default MobileBottomNav;
