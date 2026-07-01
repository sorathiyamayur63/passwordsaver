import React, { memo, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Star, Lock, CreditCard, FileText, Key } from 'lucide-react';
import { Card } from '../ui';
import { useVaultStore } from '../../store/vaultStore';
import { FaviconOrIcon } from '../vault/FaviconOrIcon';

const TYPE_ICONS = {
  login: Shield,
  card: CreditCard,
  note: FileText,
  api_key: Key,
};

/**
 * RecentItemsWidget — reads items from vaultStore via selector.
 * Sorts by lastModifiedAt and shows top 6.
 * Only re-renders when items reference changes.
 */
export const RecentItemsWidget = memo(({ onItemClick }) => {
  const items = useVaultStore(state => state.items);

  const recentItems = useMemo(() => {
    return [...items]
      .filter(i => !i.isDeleted)
      .sort((a, b) => new Date(b.lastModifiedAt) - new Date(a.lastModifiedAt))
      .slice(0, 6);
  }, [items]);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Items</h2>
      <Card padding="none" className="overflow-hidden">
        {recentItems.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-3 opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">No vault items yet. Add your first password.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {recentItems.map(item => {
              const title = item.decryptedData?.title || 'Untitled';
              const ItemIcon = TYPE_ICONS[item.itemType] || Shield;
              return (
                <div
                  key={item.uuid}
                  onClick={() => onItemClick?.(item)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group"
                >
                  <div className="h-9 w-9 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
                    <FaviconOrIcon
                      url={item.decryptedData?.website || item.decryptedData?.url}
                      type={item.itemType}
                      className="h-full w-full object-cover"
                      fallbackClassName="h-4 w-4 text-[var(--text-secondary)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</p>
                    <p className="text-xs text-[var(--text-muted)] capitalize">{item.itemType?.replace('_', ' ')}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] shrink-0 group-hover:text-[var(--text-secondary)] transition-colors">
                    {formatTime(item.lastModifiedAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
});
RecentItemsWidget.displayName = 'RecentItemsWidget';
