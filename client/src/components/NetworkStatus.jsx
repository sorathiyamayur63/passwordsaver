import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online. Vault synced.', { id: 'network-status' });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You're offline. Changes will save when connection is restored.", { 
        id: 'network-status', duration: Infinity 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null; // Renders through toast system
};