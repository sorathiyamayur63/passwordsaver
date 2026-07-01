import React, { memo, useState, useEffect, useCallback } from 'react';
import {
  Shield, Trash2, User, Key, Clock, CheckCheck, Bell, Database, RefreshCw, MapPin
} from 'lucide-react';
import { Card } from '../ui';

const api_url = import.meta.env.VITE_API_URL || '';

const ACTION_META = {
  VAULT_CREATE:        { label: 'Item added',              icon: Shield,   color: '#10b981' },
  VAULT_UPDATE:        { label: 'Item updated',             icon: Shield,   color: '#6366f1' },
  VAULT_DELETE:        { label: 'Item moved to trash',      icon: Trash2,   color: '#ef4444' },
  VAULT_EXPORT:        { label: 'Vault exported',           icon: Key,      color: '#f59e0b' },
  PASSWORD_CHANGE:     { label: 'Password changed',         icon: Key,      color: '#f59e0b' },
  LOGIN_SUCCESS:       { label: 'Signed in',                icon: User,     color: '#10b981' },
  LOGIN_NEW_LOCATION:  { label: '⚠️ New location sign-in',  icon: MapPin,   color: '#f97316' },
  LOGOUT:              { label: 'Signed out',               icon: User,     color: '#6b7280' },
  BACKUP_EXPORT:       { label: 'Backup exported',          icon: Database, color: '#6366f1' },
  BACKUP_IMPORT:       { label: 'Backup imported',          icon: Database, color: '#6366f1' },
  CATEGORY_CREATE:     { label: 'Category created',         icon: Shield,   color: '#10b981' },
  CATEGORY_DELETE:     { label: 'Category deleted',         icon: Trash2,   color: '#ef4444' },
  GROUP_CREATE:        { label: 'Group created',            icon: User,     color: '#10b981' },
  GROUP_DELETE:        { label: 'Group deleted',            icon: Trash2,   color: '#ef4444' },
  PERSON_CREATE:       { label: 'Person added',             icon: User,     color: '#10b981' },
  PERSON_DELETE:       { label: 'Person removed',           icon: Trash2,   color: '#ef4444' },
  TEMPLATE_CREATE:     { label: 'Template created',         icon: Shield,   color: '#10b981' },
  TEMPLATE_DELETE:     { label: 'Template deleted',         icon: Trash2,   color: '#ef4444' },
  ACCOUNT_UPDATE:      { label: 'Account updated',          icon: User,     color: '#6366f1' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/**
 * ActivityFeedWidget — fetches from /api/notifications.
 * Independent data fetching — does not block or affect other widgets.
 * Works on both localhost and deployed (uses VITE_API_URL).
 */
export const ActivityFeedWidget = memo(() => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notif_read') || '[]')); }
    catch { return new Set(); }
  });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${api_url}/api/notifications?limit=10`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('notif_read', JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Activity Feed</h2>
        <button
          onClick={fetch_}
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Refresh activity"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-[var(--text-muted)] mb-2 opacity-40" />
            <p className="text-xs text-[var(--text-muted)]">Could not load activity</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 mx-auto text-[var(--text-muted)] mb-2 opacity-40" />
            <p className="text-xs text-[var(--text-muted)]">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto app-scrollbar">
            {notifications.map((n, i) => {
              const id = n._id || `${n.action}-${i}`;
              const isRead = readIds.has(id);
              const meta = ACTION_META[n.action] || { label: n.action, icon: Clock, color: 'var(--text-muted)' };
              const IconComp = meta.icon;
              return (
                <div
                  key={id}
                  onClick={() => markRead(id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isRead ? 'opacity-60' : 'hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.color + '20' }}
                  >
                    <IconComp className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)]">{meta.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{timeAgo(n.timestamp)}</p>
                  </div>
                  {!isRead && (
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
});
ActivityFeedWidget.displayName = 'ActivityFeedWidget';
