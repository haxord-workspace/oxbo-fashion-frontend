import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUserRole } from '../../features/auth/authSlice';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();
  const userRole = useAppSelector(selectUserRole);

  if (!isAuthenticated) {
    // If trying to access admin route, redirect to admin login
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    // If authenticated but unauthorized role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
