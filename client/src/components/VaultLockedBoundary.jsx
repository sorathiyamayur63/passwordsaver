import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onVaultLocked, offVaultLocked } from '../crypto';
import { useAuthStore } from '../store/authStore';

export const VaultLockedBoundary = ({ children }) => {
  const navigate = useNavigate();
  const pathRef = useRef(window.location.pathname);

  // Keep ref updated without triggering effect re-runs on react-router context
  useEffect(() => {
    const handlePopState = () => { pathRef.current = window.location.pathname; };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleLock = () => {
      if (useAuthStore.getState().isAuthenticated && pathRef.current !== '/unlock') {
        navigate('/unlock', { state: { from: pathRef.current } });
      }
    };
    
    onVaultLocked(handleLock);
    return () => offVaultLocked(handleLock);
  }, [navigate]);

  return <>{children}</>;
};