import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLoadingScreen from './AuthLoadingScreen';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Route guard that requires an active Supabase authentication session.
 * Unauthenticated users are redirected to /login, preserving their destination in location state.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen message="Validating authentication session..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
