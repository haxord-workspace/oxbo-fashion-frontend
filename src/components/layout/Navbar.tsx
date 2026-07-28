import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Bell } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleCart, toggleMobileMenu } from '../../features/ui/uiSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { Link, useLocation } from 'react-router-dom';
import { userNotificationsApi } from '../../services/user/notifications.Api';

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, [isAuthenticated, location.pathname]); // Re-fetch on route change as well

  return (
    <header className="bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-8 h-20">
        
        {/* Left: Mobile Menu (Custom Staggered Hamburger) */}
        <div className="flex items-center flex-1">
          <button 
            onClick={() => dispatch(toggleMobileMenu())}
            className="p-2 -ml-2 text-primary hover:opacity-70 transition-opacity"
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
          <Link to="/" className="inline-block">
            <img
              src="/images/OxboLogo.png"
              alt="Oxbo"
              className="h-10 sm:h-12 w-10 sm:w-12 rounded-xl object-cover"
            />
          </Link>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center justify-end flex-1 space-x-2 sm:space-x-4">
          <button className="p-2 text-primary hover:opacity-70 transition-opacity">
            <Search className="w-6 h-6" strokeWidth={1.5} />
          </button>
          
          <Link 
            to={isAuthenticated ? "/profile" : "/login"} 
            className="p-2 text-primary hover:opacity-70 transition-opacity hidden sm:block"
            title="Account"
          >
            <User className="w-6 h-6" strokeWidth={1.5} />
          </Link>

          {isAuthenticated && (
            <Link 
              to="/notifications" 
              className="p-2 text-primary hover:opacity-70 transition-opacity relative hidden sm:block"
              title="Notifications"
            >
              <Bell className="w-6 h-6" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          <button 
            className="p-2 text-primary hover:opacity-70 transition-opacity relative hidden sm:block"
            onClick={() => dispatch(toggleCart())}
          >
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
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
