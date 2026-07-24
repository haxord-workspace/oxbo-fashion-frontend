import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleCart } from '../../features/ui/uiSlice';
import { selectCartCount } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useState, useEffect } from 'react';
import { userNotificationsApi } from '../../services/user/notifications.Api';

const MobileBottomNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const cartCount = useAppSelector(selectCartCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadCount = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await userNotificationsApi.getUnreadNotifications();
        if (isMounted) {
          setUnreadCount(response.count || response.unreadCount || response || 0);
        }
      } catch (error) {
        console.error('Failed to fetch unread notifications count', error);
      }
    };
    
    fetchUnreadCount();
  }, [isAuthenticated, location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 py-2 flex justify-between items-center pb-safe">
      <Link to="/" className={`flex flex-col items-center p-1 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
        <Home className="w-6 h-6 mb-1" strokeWidth={isActive('/') ? 2 : 1.5} />
        <span className="text-[10px] font-bold">HOME</span>
      </Link>
      
      <Link to="/shop" className={`flex flex-col items-center p-1 ${isActive('/shop') ? 'text-primary' : 'text-gray-500'}`}>
        <LayoutGrid className="w-6 h-6 mb-1" strokeWidth={isActive('/shop') ? 2 : 1.5} />
        <span className="text-[10px] font-bold">SHOP</span>
      </Link>

      <button 
        onClick={() => dispatch(toggleCart())}
        className="flex flex-col items-center p-1 relative text-gray-500"
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6 mb-1" strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#044E4D] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">CART</span>
      </button>

      <Link 
        to={isAuthenticated ? "/profile" : "/login"} 
        className={`flex flex-col items-center p-1 ${isActive('/profile') || isActive('/login') ? 'text-primary' : 'text-gray-500'}`}
      >
        <User className="w-6 h-6 mb-1" strokeWidth={isActive('/profile') || isActive('/login') ? 2 : 1.5} />
        <span className="text-[10px] font-bold">ACCOUNT</span>
      </Link>

      {isAuthenticated && (
        <Link 
          to="/notifications" 
          className={`flex flex-col items-center p-1 ${isActive('/notifications') ? 'text-primary' : 'text-gray-500'}`}
        >
          <div className="relative">
            <Bell className="w-6 h-6 mb-1" strokeWidth={isActive('/notifications') ? 2 : 1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">NOTIFICATIONS</span>
        </Link>
      )}
    </div>
  );
};

export default MobileBottomNav;
