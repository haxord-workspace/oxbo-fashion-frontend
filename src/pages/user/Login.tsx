import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { login, setAuthLoading, setAuthError, selectAuthInitialized } from '../../features/auth/authSlice';
import { authApi } from '../../services/authApi';
import { setAdvancedMatching } from '../../utils/metaPixel';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface FormErrors {
  identifier?: string;
  password?: string;
}

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, user } = useAppSelector(state => state.auth);
  const isInitialized = useAppSelector(selectAuthInitialized);

  // The page the user was on before being redirected to login
  const from = (location.state as any)?.from || '/';

  // Only redirect once auth is confirmed — prevents false redirect on refresh
  useEffect(() => {
    if (isInitialized && user) {
      navigate(from, { replace: true });
    }
  }, [isInitialized, user, navigate, from]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or Mobile Number is required';
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
      const response = await authApi.login(identifier.trim(), password);
      
      // Derived only from backend-supplied role data - checking the user's
      // own email string is bypassable by anyone registering an
      // email containing "admin".
      const roleStr = String(response.user.role || '').toLowerCase();
      const isAdmin =
        roleStr === 'admin' ||
        roleStr.includes('admin') ||
        (response.user as any).roleId?.name?.toLowerCase().includes('admin');
      
      if (isAdmin) {
        dispatch(setAuthLoading(false));
        toast.error('Admins must use the admin login page.');
        navigate('/admin/login');
        return;
      }
      
      // Ensure the role is set for the frontend Redux state
      response.user.role = 'user';

      dispatch(login(response));
      setAdvancedMatching(response.user);
      toast.success(response.message || 'Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      toast.error("Google login failed: No credential received.");
      return;
    }

    dispatch(setAuthLoading(true));
    dispatch(setAuthError(''));

    try {
      const response = await authApi.googleLogin(credential);

      const roleStr = String(response.user.role || '').toLowerCase();
      const isAdmin =
        roleStr === 'admin' ||
        roleStr.includes('admin') ||
        (response.user as any).roleId?.name?.toLowerCase().includes('admin');
      
      if (isAdmin) {
        dispatch(setAuthLoading(false));
        toast.error('Admins must use the admin login page.');
        navigate('/admin/login');
        return;
      }
      
      response.user.role = 'user';

      dispatch(login(response));
      setAdvancedMatching(response.user);
      toast.success(response.message || 'Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to login with Google';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Login Widget Failed');
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
              <label htmlFor="identifier" className="sr-only">Email address or Mobile Number</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.identifier ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
                placeholder="EMAIL ADDRESS or MOBILE NUMBER"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors({ ...errors, identifier: undefined });
                }}
              />
              {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier}</p>}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 pr-10 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                shape="rectangular"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
