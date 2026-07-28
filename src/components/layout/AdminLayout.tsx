import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser, selectIsStoreManager } from '../../features/auth/authSlice';
import { authApi } from '../../services/authApi';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Archive,
  Image as ImageIcon,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  Award,
  Bell,
  Upload
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Bulk Upload', path: '/admin/bulk-upload', icon: Upload },
  { name: 'Categories', path: '/admin/categories', icon: Tags },
  { name: 'Brands', path: '/admin/brands', icon: Award },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: Archive },
  { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
  { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Stores', path: '/admin/stores', icon: Store },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isStoreManager = useAppSelector(selectIsStoreManager);

  const handleLogout = async () => {
    try {
      const response = await authApi.logout();
      dispatch(logout());
      toast.success(response.message || 'Admin logged out');
      navigate('/admin/login');
    } catch (err: any) {
      toast.error(err.message || 'Logout failed');
    }
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <Link to="/admin/dashboard" className="flex-1 flex justify-center">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic" style={{ fontFamily: 'Impact, sans-serif' }}>
              <span className="font-normal text-primary ml-1 text-xl">Oxbo Admin</span>
            </h1>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-primary">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems
              .filter(item => {
                if (isStoreManager) {
                  return !['Stores', 'Users', 'Settings', 'Banners', 'Coupons'].includes(item.name);
                }
                return true;
              })
              .map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                    }`}
                  >
                    <Icon size={20} className={`mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center lg:hidden">
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 hover:text-primary rounded-md">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-3">
              {/* Notification Bell Icon */}
              <Link
                to="/admin/notifications"
                className="relative p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                title="Notifications"
              >
                <Bell size={22} />
              </Link>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
