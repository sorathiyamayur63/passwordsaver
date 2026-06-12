import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import { unlockVault, lockVault } from '../crypto';

const PUBLIC_PATHS = ['/', '/login', '/register', '/unlock','/features','/faq','/contact','/privacy','/terms'];

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, setUser, clearUser, setLoading, setError, setSavedUsername, savedUsername } = useAuthStore();

  const handleUnauthorized = useCallback(() => {
    if (window.location.pathname === '/login') return;

    clearUser();
    lockVault();
    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      navigate('/login', { replace: true });
    }
     navigate('/login', {
    replace: true,
    state: { reason: 'session_expired' }
  });
  }, [clearUser, navigate]);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [handleUnauthorized]);

  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success) {
        setUser(res.data.user);
      }
    }catch (err) {
  clearUser();
  
  if (window.location.pathname !== '/login') {
    navigate('/login', { replace: true });
  }
} finally {
      setLoading(false);
    }
  }, [setUser, clearUser, setLoading,navigate]);

  const login = async ({ username, password, rememberMe }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Step 1: Backend authentication via Argon2id verification
      const res = await authApi.login({ username, password });
      
      if (res.success) {
          window.__sessionExpired = false;
        const userData = res.data.user;
        
        // Step 2: Zero-Knowledge Client-Side Key Derivation
        // Assume user.vaultKeySalt is returned. In Phase 2 it was set to select:false, 
        // Ensure backend auth controller includes vaultKeySalt in the toSafeObject logic for successful logins.
        const vaultUnlocked = await unlockVault(password, userData.vaultKeySalt);
        
        if (!vaultUnlocked) {
          throw new Error('Failed to derive vault key.');
        }

        setUser(userData);
        if (rememberMe) setSavedUsername(username);
        else setSavedUsername('');

        navigate('/dashboard', { replace: true });
        return true;
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.register(data);
      if (res.success) {
        const userData = res.data.user;
        await unlockVault(data.password, userData.vaultKeySalt);
        setUser(userData);
        navigate('/dashboard', { replace: true });
        return true;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout, just clear local state
    } finally {
      clearUser();
      lockVault();
      navigate('/login', { replace: true });
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    savedUsername,
    initAuth,
    login,
    register,
    logout
  };
};