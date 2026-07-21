import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setAuthLoading, setAuthError, login } from '../../features/auth/authSlice';
import { authApi } from '../../services/authApi';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, token, user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      const storeManagerRoleId = import.meta.env.VITE_STORE_MANAGER_ROLE_ID;
      const userRoleId = (user as any)?.roleId?._id || (user as any)?.roleId?.id || (user as any)?.roleId || (user as any)?.role;
      const isStoreManager = storeManagerRoleId && String(userRoleId) === String(storeManagerRoleId);

      const roleStr = String(user?.role || '').toLowerCase();
      const isAdmin = 
        roleStr === 'admin' || 
        roleStr.includes('admin') ||
        (user as any)?.roleId?.name?.toLowerCase().includes('admin') ||
        (user?.email && user.email.toLowerCase().includes('admin'));
      if (isAdmin || isStoreManager) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [token, user, navigate]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(setAuthLoading(true));
    dispatch(setAuthError(''));

    try {
      const response = await authApi.login(email, password);
      
      const storeManagerRoleId = import.meta.env.VITE_STORE_MANAGER_ROLE_ID;
      const userRoleId = (response.user as any).roleId?._id || (response.user as any).roleId?.id || (response.user as any).roleId || response.user.role;
      const isStoreManager = storeManagerRoleId && String(userRoleId) === String(storeManagerRoleId);

      const roleStr = String(response.user.role || '').toLowerCase();
      const isAdmin = 
        roleStr === 'admin' || 
        roleStr.includes('admin') ||
        (response.user as any).roleId?.name?.toLowerCase().includes('admin') ||
        (response.user.email && response.user.email.toLowerCase().includes('admin'));
      
      if (!isAdmin && !isStoreManager) {
        dispatch(setAuthLoading(false));
        toast.error('Access denied. Admin privileges required.');
        return;
      }
      
      // Ensure the role is set for the frontend Redux state
      if (isAdmin && !response.user.role) {
        response.user.role = 'admin';
      } else if (isStoreManager && !response.user.role) {
        response.user.role = 'storemanager';
      }
      
      dispatch(login(response));
      toast.success(response.message || 'Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      dispatch(setAuthError(errorMsg));
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-black uppercase">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your store
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                className={`relative block w-full appearance-none rounded-md border px-3 py-3 text-black placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-1 focus:ring-black'
                }`}
                placeholder="ADMIN EMAIL"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`relative block w-full appearance-none rounded-md border px-3 py-3 pr-10 text-black placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.password ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-1 focus:ring-black'
                }`}
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-black py-3 px-4 text-sm font-semibold uppercase text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
