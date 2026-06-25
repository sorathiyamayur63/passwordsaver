import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell, User, LogOut, Settings, LockKeyhole, Shield, Key, Clock, Trash2, CheckCheck } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { lockVault } from '../../crypto';
import { authApi } from '../../services/authApi';
import toast from 'react-hot-toast';

// ─── Notifications Dropdown ───────────────────────────────────────────────────
const ACTION_META = {
  VAULT_CREATE:    { label: 'Item added',         icon: Shield,   color: 'var(--success)' },
  VAULT_UPDATE:    { label: 'Item updated',        icon: Shield,   color: 'var(--accent)' },
  VAULT_DELETE:    { label: 'Item deleted',        icon: Trash2,   color: 'var(--danger)' },
  VAULT_EXPORT:    { label: 'Vault exported',      icon: Key,      color: 'var(--warning)' },
  PASSWORD_CHANGE: { label: 'Password changed',    icon: Key,      color: 'var(--warning)' },
  LOGIN_SUCCESS:   { label: 'Signed in',           icon: User,     color: 'var(--success)' },
  LOGIN_FAIL:      { label: 'Failed sign-in',      icon: User,     color: 'var(--danger)' },
  BACKUP_EXPORT:   { label: 'Backup exported',     icon: Clock,    color: 'var(--accent)' },
  BACKUP_IMPORT:   { label: 'Backup imported',     icon: Clock,    color: 'var(--accent)' },
  CATEGORY_CREATE: { label: 'Category created',    icon: Shield,   color: 'var(--success)' },
  GROUP_CREATE:    { label: 'Group created',       icon: User,     color: 'var(--success)' },
  GROUP_DELETE:    { label: 'Group deleted',        icon: Trash2,   color: 'var(--danger)' },
  PERSON_CREATE:   { label: 'Person added',        icon: User,     color: 'var(--success)' },
  PERSON_DELETE:   { label: 'Person removed',      icon: Trash2,   color: 'var(--danger)' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationsDropdown = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notif_read') || '[]')); }
    catch { return new Set(); }
  });
  const dropRef = useRef(null);

  const unreadCount = notifications.filter(n => !readIds.has(n._id || n.timestamp)).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    const allIds = new Set(notifications.map(n => n._id || n.timestamp));
    setReadIds(allIds);
    localStorage.setItem('notif_read', JSON.stringify([...allIds]));
  };

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--bg-elevated)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fadeIn z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <h3 className="font-semibold text-sm text-[var(--text-primary)]">Activity</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline">
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto app-scrollbar">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 mx-auto text-[var(--text-muted)] mb-2 opacity-50" />
                <p className="text-xs text-[var(--text-muted)]">No recent activity</p>
              </div>
            ) : notifications.map((n, i) => {
              const id = n._id || n.timestamp;
              const isRead = readIds.has(id);
              const meta = ACTION_META[n.action] || { label: n.action, icon: Clock, color: 'var(--text-muted)' };
              const IconComp = meta.icon;
              return (
                <div
                  key={id || i}
                  onClick={() => {
                    const next = new Set(readIds);
                    next.add(id);
                    setReadIds(next);
                    localStorage.setItem('notif_read', JSON.stringify([...next]));
                  }}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0 transition-colors cursor-pointer ${isRead ? 'opacity-60' : 'hover:bg-[var(--bg-tertiary)]'}`}
                >
                  <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: meta.color + '20' }}>
                    <IconComp className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)]">{meta.label}</p>
                    {n.resourceType && (
                      <p className="text-xs text-[var(--text-muted)] truncate capitalize">{n.resourceType}</p>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{timeAgo(n.timestamp)}</p>
                  </div>
                  {!isRead && (
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
NotificationsDropdown.displayName = 'NotificationsDropdown';

// ─── Header ───────────────────────────────────────────────────────────────────
export const Header = memo(({ onMenuClick }) => {
  // Use individual selectors to avoid re-renders when unrelated state changes
  const isDark = useThemeStore(state => state.isDark);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLockVault = useCallback(() => {
    lockVault();
    navigate('/unlock');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setIsUserMenuOpen(false);
    try { await authApi.logout(); } catch {}
    window.location.replace('/login');
  }, []);

  const handleSearchClick = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  }, []);

  return (
    <header className="h-[60px] bg-[var(--bg-elevated)] border-b border-[var(--border)] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={handleSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search vault...</span>
          <span className="ml-auto text-xs bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--border)]">⌘K</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <NotificationsDropdown />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(v => !v)}
            className="h-8 w-8 bg-[var(--accent-subtle)] rounded-full flex items-center justify-center border border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-shadow"
          >
            <span className="text-xs font-bold text-[var(--accent)] uppercase">
              {user?.username?.substring(0, 2)}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden animate-fadeIn z-50">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.username}</p>
              </div>

              <div className="p-1">
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-md transition-colors"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleLockVault(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--warning)] hover:bg-[var(--warning-subtle)] rounded-md transition-colors"
                >
                  <LockKeyhole className="h-4 w-4" /> Lock Vault
                </button>
              </div>

              <div className="p-1 border-t border-[var(--border)]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-subtle)] rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});
Header.displayName = 'Header';