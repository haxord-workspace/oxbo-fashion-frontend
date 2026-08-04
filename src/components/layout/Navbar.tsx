import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Bell, Heart } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleCart, toggleMobileMenu } from '../../features/ui/uiSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { Link, useLocation, useNavigate } from 'react-router';
import { userNotificationsApi } from '../../services/user/notifications.Api';
import { X } from 'lucide-react';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadCount = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await userNotificationsApi.getUnreadNotifications();
        if (isMounted) {
          let count = 0;
          if (Array.isArray(response?.data)) {
            count = response.data.length;
          } else if (Array.isArray(response)) {
            count = response.length;
          } else {
            count = response?.count || response?.unreadCount || 0;
          }
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications count', error);
      }
    };
    
    fetchUnreadCount();
    fetchUnreadCount();
  }, [isAuthenticated, location.pathname]); // Re-fetch on route change as well

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/collections/all-drops?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-primary sticky top-0 z-40 relative">
      <div className="flex items-center justify-between px-4 md:px-8 h-14">
        
        {/* Left: Mobile Menu (Custom Staggered Hamburger) */}
        <div className="flex items-center flex-1">
          <button 
            onClick={() => dispatch(toggleMobileMenu())}
            className="p-2 -ml-2 text-white hover:opacity-70 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
              <path d="M4 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
              <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 text-center flex justify-center">
          <Link to="/" className="inline-flex items-center gap-2 sm:gap-3">
            <img
              src="/images/OxboLogo.png"
              alt="Oxbo"
              className="h-8 sm:h-10 w-8 sm:w-10 rounded-xl object-cover"
            />
            <span className="text-sm sm:text-base md:text-lg font-extrabold italic tracking-widest text-white uppercase hidden sm:block">
              OXBO FASHION
            </span>
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end flex-1 space-x-2 sm:space-x-4">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-white hover:opacity-70 transition-opacity"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <Link 
            to="/wishlist" 
            className="p-2 text-white hover:opacity-70 transition-opacity"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          
          <Link 
            to={isAuthenticated ? "/profile" : "/login"} 
            className="p-2 text-white hover:opacity-70 transition-opacity hidden sm:block"
            title="Account"
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          {isAuthenticated && (
            <Link 
              to="/notifications" 
              className="p-2 text-white hover:opacity-70 transition-opacity relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold h-3 w-3 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          <button 
            className="p-2 text-white hover:opacity-70 transition-opacity relative hidden sm:block"
            onClick={() => dispatch(toggleCart())}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-white text-primary text-[9px] font-bold h-3 w-3 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Overlay Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 shadow-sm z-30 animate-in fade-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <Search size={20} className="text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products, categories, tags..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-800 placeholder-gray-400"
            />
            <button type="button" onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-black ml-2 shrink-0">
              <X size={20} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
