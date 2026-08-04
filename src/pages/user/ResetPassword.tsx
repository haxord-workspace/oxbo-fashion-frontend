import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { authApi } from '../../services/authApi';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface FormErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pre-fill email if passed from ForgotPassword page
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (otp.trim().length < 4) {
      newErrors.otp = 'Please enter a valid OTP';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp,
        newPassword
      });
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err: any) {
      const responseData = err.response?.data;
      
      if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        const backendErrors: FormErrors = {};
        responseData.errors.forEach((error: any) => {
          const field = error.field?.replace('body.', '');
          if (field === 'newPassword' || field === 'email' || field === 'otp') {
            backendErrors[field as keyof FormErrors] = error.message;
          }
        });
        
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
          toast.error('Please fix the errors in the form.');
          setIsLoading(false);
          return;
        }
      }

      const errorMessage = responseData?.message || err.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary uppercase">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to your email and your new password.
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
              <label htmlFor="otp" className="sr-only">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.otp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
                placeholder="OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (errors.otp) setErrors({ ...errors, otp: undefined });
                }}
              />
              {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
            </div>

            <div className="relative">
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 pr-10 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
                placeholder="NEW PASSWORD"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
            </div>

            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`relative block w-full appearance-none rounded-none border px-3 py-3 pr-10 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                }`}
                placeholder="CONFIRM PASSWORD"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center border border-transparent bg-primary py-3 px-4 text-sm font-semibold uppercase text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reset Password'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link to="/login" className="font-semibold text-primary hover:underline text-sm">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
