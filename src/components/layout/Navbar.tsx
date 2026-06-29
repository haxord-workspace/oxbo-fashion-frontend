import React from 'react';
import { Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleCart, toggleMobileMenu } from '../../features/ui/uiSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { selectWishlistCount } from '../../features/wishlist/wishlistSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/register');
    }
  };

  return (
    <header className="bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-8 h-20">
        
        {/* Left: Mobile Menu (Custom Staggered Hamburger) */}
        <div className="flex items-center flex-1">
          <button 
            onClick={() => dispatch(toggleMobileMenu())}
            className="p-2 -ml-2 text-black hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20" stroke="black" strokeWidth="2" strokeLinecap="square"/>
              <path d="M4 12H16" stroke="black" strokeWidth="2" strokeLinecap="square"/>
              <path d="M4 18H20" stroke="black" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 text-center flex justify-center">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic" style={{ fontFamily: 'Impact, sans-serif' }}>
              Oxbo<span className="font-normal text-xl ml-1">✧</span>
            </h1>
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end flex-1 space-x-2 sm:space-x-4">
          <button className="p-2 text-black hover:opacity-70 transition-opacity">
            <Search className="w-6 h-6" strokeWidth={1.5} />
          </button>
          
          <Link 
            to={isAuthenticated ? "/profile" : "/login"} 
            className="p-2 text-black hover:opacity-70 transition-opacity hidden sm:block"
            title="Account"
          >
            <User className="w-6 h-6" strokeWidth={1.5} />
          </Link>

          <Link 
            to="/wishlist" 
            onClick={handleWishlistClick}
            className="p-2 text-black hover:opacity-70 transition-opacity relative hidden sm:block"
            title="Wishlist"
          >
            <Heart className="w-6 h-6" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-black text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button 
            className="p-2 text-black hover:opacity-70 transition-opacity relative"
            onClick={() => dispatch(toggleCart())}
          >
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-black text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
