import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { isVaultUnlocked } from '../../crypto';
import { Spinner } from '../ui';

export const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-tertiary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vault key missing from memory (e.g., page refresh or idle timeout)
  if (!isVaultUnlocked() && location.pathname !== '/unlock') {
    return <Navigate to="/unlock" state={{ from: location }} replace />;
  }

  return <Outlet />;
};