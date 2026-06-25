import React, { useCallback, useMemo, memo } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Home, Shield, Star, Search, Key, 
  ShieldCheck, Monitor, DatabaseBackup, 
  Layout, Folder, Settings, LockKeyhole, X, Users
} from 'lucide-react';
import { lockVault } from '../../crypto';

// Static data — defined OUTSIDE component so it never changes reference
const NAV_ITEMS = [
  { section: 'MAIN', items: [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Vault', icon: Shield, path: '/vault' },
    { label: 'Favorites', icon: Star, path: '/favorites' },
    { label: 'Search', icon: Search, path: '/search', isSearch: true },
    { label: 'Generator', icon: Key, path: '/generator' },
  ]},
  { section: 'SECURITY', items: [
    { label: 'Security Center', icon: ShieldCheck, path: '/security' },
    { label: 'Devices', icon: Monitor, path: '/devices' },
    { label: 'Backups', icon: DatabaseBackup, path: '/backups' },
  ]},
  { section: 'MANAGE', items: [
    { label: 'Groups', icon: Users, path: '/groups' },
    { label: 'Templates', icon: Layout, path: '/templates' },
    { label: 'Categories', icon: Folder, path: '/categories' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]}
];

// Stable active class function — defined outside to avoid recreation
const getNavClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--accent-subtlehover)] hover:text-[var(--text-primary)]'
  }`;

export const Sidebar = memo(({ onClose }) => {
  const navigate = useNavigate();

  const handleLockVault = useCallback(() => {
    lockVault();
    navigate('/unlock');
  }, [navigate]);

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 768 && onClose) onClose();
  }, [onClose]);

  const handleSearchClick = useCallback(() => {
    // Dispatch global search shortcut
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    if (onClose && window.innerWidth < 768) onClose();
  }, [onClose]);

  // Memoize nav rendering so it doesn't recompute on every render
  const navContent = useMemo(() => (
    NAV_ITEMS.map((group, i) => (
      <div key={i}>
        <div className="px-3 mb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {group.section}
        </div>
        <div className="space-y-1">
          {group.items.map((item) => {
            if (item.isSearch) {
              return (
                <button
                  key={item.path}
                  onClick={handleSearchClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={getNavClass}
                onClick={handleLinkClick}
                end={item.path === '/vault'}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    ))
  ), [handleSearchClick, handleLinkClick]);

  return (
    <div
      className="flex flex-col h-full bg-[var(--bg-secondary)]"
    >
      {/* Brand Header */}
      <div className="h-[60px] flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0">
        <Link to="/" className="flex items-center gap-2 text-[var(--text-primary)] hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Passwordsaver Logo" className="h-8 w-8" />
          <span className="font-bold text-lg tracking-tight">passwordsaver</span>
        </Link>
        <button onClick={onClose} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 app-scrollbar">
        {navContent}
      </div>

      {/* Footer Lock Button */}
      <div className="p-4 border-t border-[var(--border)] shrink-0 space-y-2">
        <button
          onClick={handleLockVault}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-colors"
        >
          <LockKeyhole className="h-4 w-4" />
          Lock Vault
        </button>
      </div>
    </div>
  );
});
Sidebar.displayName = 'Sidebar';