import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lockVault } from './crypto';

// --- Public Landing Pages (Default Imports) ---
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import QnAPage from './pages/QnAPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactPage from './pages/ContactPage';

// --- Authentication Pages ---
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnlockVaultPage } from './pages/auth/UnlockVaultPage';

// --- Core Application Pages ---
import { DashboardPage } from './pages/DashboardPage';
import { VaultPage } from './pages/vault/VaultPage';
import { GeneratorPage } from './pages/GeneratorPage';

// Global Providers & Wrappers
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VaultLockedBoundary } from './components/VaultLockedBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import { Spinner } from './components/ui';

// Layout & Guards
import { AuthGuard } from './components/auth/AuthGuard';
import { AppLayout } from './components/layout/AppLayout';
import { GlobalSearch } from './components/search/GlobalSearch';

// Lazy Loaded Pages (Heavy/Infrequent components)
const SecurityCenterPage = lazy(() => import('./pages/SecurityCenterPage').then(module => ({ default: module.SecurityCenterPage })));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage').then(module => ({ default: module.TemplatesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const DevicesPage = lazy(() => import('./pages/DevicesPage').then(module => ({ default: module.DevicesPage })));
const BackupsPage = lazy(() => import('./pages/BackupsPage').then(module => ({ default: module.BackupsPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(module => ({ default: module.CategoriesPage })));
const FavoritesPage = lazy(() => import('./pages/vault/FavoritesPage').then(module => ({ default: module.FavoritesPage })));
const TrashPage = lazy(() => import('./pages/vault/TrashPage').then(module => ({ default: module.TrashPage })));

const FallbackLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center"><Spinner size="lg" /></div>
);

const PUBLIC_PATHS = [
  '/',
  '/features',
  '/faq',
  '/privacy',
  '/terms',
  '/contact',
  '/login',
  '/register',
  '/unlock'
];

const SecurityObserver = () => {
  const location = useLocation();

  useEffect(() => {
    // If navigating to a public page while authenticated, lock the vault for security.
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (PUBLIC_PATHS.includes(location.pathname) && isAuthenticated) {
      lockVault();
    }
  }, [location.pathname]);

  return null;
};

function App() {
  const { initAuth } = useAuth();
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    if (typeof initTheme === 'function') initTheme();

    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      if (typeof initAuth === 'function') initAuth();
    } else {
      // Stop the global loader if we land on a public page (e.g. login)
      useAuthStore.getState().setLoading(false);
    }
  }, [initAuth, initTheme]);

  useEffect(() => {
    const handleUnauthorized = () => {
      // Prevent redirect loop
      if (window.location.pathname === '/login') {
        return;
      }

      window.location.replace('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <ErrorBoundary>
        <NetworkStatus />
        <VaultLockedBoundary>
          <div className="min-h-screen transition-colors duration-200 bg-[var(--bg-tertiary)]">
            <SecurityObserver />
            <GlobalSearch />
            
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/faq" element={<QnAPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unlock" element={<UnlockVaultPage />} />
              
              {/* Protected Application Routes 
                Using explicit component parameters guarantees that layout panels (Sidebar, Header) 
                load securely alongside your authentication checkpoint.
              */}
              <Route element={<AuthGuard />}>
                <Route element={<AppLayout />}>
                  {/* Core Vault */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/vault" element={<VaultPage />} />
                  <Route path="/generator" element={<GeneratorPage />} />
                  
                  {/* Secondary Views (Lazy Loaded) */}
                  <Route path="/vault/trash" element={<Suspense fallback={<FallbackLoader />}><TrashPage /></Suspense>} />
                  <Route path="/favorites" element={<Suspense fallback={<FallbackLoader />}><FavoritesPage /></Suspense>} />
                  <Route path="/security" element={<Suspense fallback={<FallbackLoader />}><SecurityCenterPage /></Suspense>} />
                  <Route path="/templates" element={<Suspense fallback={<FallbackLoader />}><TemplatesPage /></Suspense>} />
                  <Route path="/devices" element={<Suspense fallback={<FallbackLoader />}><DevicesPage /></Suspense>} />
                  <Route path="/backups" element={<Suspense fallback={<FallbackLoader />}><BackupsPage /></Suspense>} />
                  <Route path="/settings" element={<Suspense fallback={<FallbackLoader />}><SettingsPage /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<FallbackLoader />}><ProfilePage /></Suspense>} />
                  <Route path="/categories" element={<Suspense fallback={<FallbackLoader />}><CategoriesPage /></Suspense>} />
                  
                  {/* Fallback route within application */}
                  <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>
              
              {/* Catch All Redirect to Home Website */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </VaultLockedBoundary>
    </ErrorBoundary>
  );
}

export default App;