import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { register as registerAction, setAuthLoading, setAuthError } from '../../features/auth/authSlice';
import { authApi } from '../../services/authApi';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      // Must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
      if (!strongRegex.test(password)) {
        newErrors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (e.g., Password123!)';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
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
      const data = {
        firstName,
        lastName,
        email,
        password,
        phone
      };

      const response = await authApi.register(data);

      dispatch(registerAction(response));
      toast.success(response.message || 'Account created successfully!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to register';
      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary uppercase">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className={`relative block w-full appearance-none rounded-xl border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                placeholder="FIRST NAME"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                }}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className={`relative block w-full appearance-none rounded-xl border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                placeholder="LAST NAME"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                }}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                className={`relative block w-full appearance-none rounded-xl border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
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
              <label htmlFor="phone" className="sr-only">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`relative block w-full appearance-none rounded-xl border px-3 py-3 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
                  }`}
                placeholder="PHONE NUMBER"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`relative block w-full appearance-none rounded-xl border px-3 py-3 pr-10 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`relative block w-full appearance-none rounded-xl border px-3 py-3 pr-10 text-primary placeholder-gray-500 focus:z-10 focus:outline-none sm:text-sm ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary focus:ring-primary'
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-primary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
