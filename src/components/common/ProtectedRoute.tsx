import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
  //   // If trying to access admin route, redirect to admin login
  //   if (location.pathname.startsWith('/admin')) {
  //     return <Navigate to="/admin/login" replace />;
  //   }
  //   return <Navigate to="/login" replace state={{ from: location }} />;
  // }

  // if (allowedRoles && !allowedRoles.includes(userRole as any)) {
  //   // If authenticated but unauthorized role
  //   if (userRole === 'admin') {
  //     return <Navigate to="/admin/dashboard" replace />;
  //   } else {
  //     return <Navigate to="/" replace />;
  //   }
  // }
  }
  return <Outlet />;
};

export default ProtectedRoute;
