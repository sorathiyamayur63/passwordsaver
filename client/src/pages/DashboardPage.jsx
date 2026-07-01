import React, { useEffect, useState, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { VaultItemModal } from '../components/vault/VaultItemModal';
import { useVaultStore } from '../store/vaultStore';
import { useVault } from '../hooks/useVault';

// Isolated Dashboard Widgets — each reads only what it needs
import { WelcomeCard } from '../components/dashboard/WelcomeCard';
import { StatsWidget } from '../components/dashboard/StatsWidget';
import { QuickActionsWidget } from '../components/dashboard/QuickActionsWidget';
import { RecentItemsWidget } from '../components/dashboard/RecentItemsWidget';
import { ActivityFeedWidget } from '../components/dashboard/ActivityFeedWidget';
import { SecurityScoreWidget } from '../components/dashboard/SecurityScoreWidget';

/**
 * DashboardPage — Orchestrates isolated widgets.
 *
 * Architecture notes:
 * - Each widget reads only the Zustand slice it needs via selector.
 * - No widget re-renders because another widget's data changed.
 * - useVault() here only used for initial data load + mutations.
 * - React Query's staleTime (5min) prevents redundant API calls on re-mount.
 */
const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState(null);

  // These are needed for the VaultItemModal mutations
  const { updateItem, deleteItem, fetchItems } = useVault();
  const items = useVaultStore(state => state.items);

  // Only fetch if vault is empty (first load or after unlock)
  useEffect(() => {
    if (items.length === 0) {
      fetchItems();
    }
  }, []);

  // Open item modal from URL param (e.g. from Security Center "Update" link)
  const itemUuid = searchParams.get('item');
  useEffect(() => {
    if (!itemUuid || !items.length) return;
    const matched = items.find(i => i.uuid === itemUuid);
    if (matched) {
      setSelectedItem(matched);
      setSearchParams({}, { replace: true });
    }
  }, [itemUuid, items]);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Card — reads only username */}
      <WelcomeCard />

      {/* Stats — reads items from store, computes real security score */}
      <StatsWidget />

      {/* Quick Actions — fully static, never re-renders */}
      <QuickActionsWidget />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Items takes 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <RecentItemsWidget onItemClick={handleItemClick} />
          <ActivityFeedWidget />
        </div>

        {/* Security Score takes 1/3 width */}
        <div>
          <SecurityScoreWidget />
        </div>
      </div>

      {/* Item Detail Modal — only mounts when item is selected */}
      <VaultItemModal
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        item={selectedItem}
        onUpdate={updateItem}
        onDelete={(uuid) => { deleteItem(uuid); handleCloseModal(); }}
      />
    </div>
  );
};

export { DashboardPage };