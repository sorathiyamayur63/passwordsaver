import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onVaultLocked, offVaultLocked } from '../crypto';
import { useAuthStore } from '../store/authStore';

export const VaultLockedBoundary = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleLock = () => {
      // If the user is authenticated and not already on the unlock page, redirect them to unlock.
      if (useAuthStore.getState().isAuthenticated && location.pathname !== '/unlock') {
        navigate('/unlock', { state: { from: location.pathname } });
      }
    };
    
    onVaultLocked(handleLock);
    return () => offVaultLocked(handleLock);
  }, [navigate, location.pathname]);

  return <>{children}</>;
};