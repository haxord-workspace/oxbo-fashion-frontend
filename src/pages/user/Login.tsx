import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login, setAuthLoading, setAuthError } from '../../features/auth/authSlice';
import { authApi } from '../../services/authApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, user, token } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (user || token) {
      navigate('/');
    }
  }, [user, token, navigate]);

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
    
    if (!validateForm()) {
      return;
    }

    dispatch(setAuthLoading(true));
    dispatch(setAuthError(''));

    try {
      const response = await authApi.login(email, password);
      
      const roleStr = String(response.user.role || '').toLowerCase();
      const isAdmin = 
        roleStr === 'admin' || 
        roleStr.includes('admin') ||
        (response.user as any).roleId?.name?.toLowerCase().includes('admin') ||
        (response.user.email && response.user.email.toLowerCase().includes('admin'));
      
      if (isAdmin) {
        dispatch(setAuthLoading(false));
        toast.error('Admins must use the admin login page.');
        navigate('/admin/login');
        return;
      }
      
      // Ensure the role is set for the frontend Redux state
      response.user.role = 'user';
      
      dispatch(login(response));
      toast.success(response.message || 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary uppercase">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              create a new account
            </Link>
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
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div className="flex items-center justify-end mt-2">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center border border-transparent bg-primary py-3 px-4 text-sm font-semibold uppercase text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
