import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../features/auth/authSlice';
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
  Award
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: Tags },
  { name: 'Brands', path: '/admin/brands', icon: Award },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Inventory', path: '/admin/inventory', icon: Archive },
  { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
  { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Stores', path: '/admin/stores', icon: Store },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

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
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
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
              Oxbo<span className="font-normal text-[#e35a39] ml-1 text-xl">Admin</span>
            </h1>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Icon size={20} className={`mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'}`} />
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
            <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 hover:text-black rounded-md">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white font-bold uppercase">
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
