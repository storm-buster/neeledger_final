import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLoadingScreen from './AuthLoadingScreen';

interface RequireAdminProps {
  children: React.ReactNode;
}

/**
 * Route guard that requires trusted administrator authorization.
 * Resolves role strictly from the trusted database profile (public.users.is_admin).
 * - Unauthenticated visitors -> Redirected to /login
 * - Authenticated non-admin users -> Redirected to /unauthorized
 */
export default function RequireAdmin({ children }: RequireAdminProps) {
  const { user, isAdmin, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return <AuthLoadingScreen message="Verifying administrative permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
  }

  return <>{children}</>;
}
