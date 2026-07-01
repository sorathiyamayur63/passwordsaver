import React, { memo, useMemo } from 'react';
import { ShieldCheck, Star, Shield, Clock } from 'lucide-react';
import { Card } from '../ui';
import { useVaultStore } from '../../store/vaultStore';
import { calculateVaultHealthScore } from '../../utils/securityAnalysis';

/**
 * StatsWidget — reads items/favorites from vaultStore via selectors.
 * Computes REAL security score from decrypted items.
 * Only re-renders when items array reference changes.
 */
const StatCard = memo(({ icon: Icon, label, value, color, sub }) => (
  <Card padding="md" className="flex items-center gap-4">
    <div
      className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: (color || 'var(--accent)') + '1a' }}
    >
      <Icon className="h-6 w-6" style={{ color: color || 'var(--accent)' }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider truncate">{label}</p>
      <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5 leading-none">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  </Card>
));
StatCard.displayName = 'StatCard';

export const StatsWidget = memo(() => {
  const items = useVaultStore(state => state.items);
  const favoritesCount = useMemo(() => items.filter(i => i.isFavorite).length, [items]);

  // Real security score computed from cached vault items (no extra API call)
  const securityScore = useMemo(() => {
    if (!items || items.length === 0) return null;
    const result = calculateVaultHealthScore(items);
    return result;
  }, [items]);

  const scoreValue = securityScore ? `${securityScore.score}` : items.length === 0 ? 'N/A' : '—';
  const scoreColor = securityScore
    ? securityScore.score >= 80
      ? 'var(--success)'
      : securityScore.score >= 60
        ? 'var(--warning)'
        : 'var(--danger)'
    : 'var(--text-muted)';

  const lastActive = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={ShieldCheck}
        label="Secured Items"
        value={items.length}
        color="var(--accent)"
        sub="in your vault"
      />
      <StatCard
        icon={Star}
        label="Favorites"
        value={favoritesCount}
        color="var(--warning)"
        sub="marked as favorite"
      />
      <StatCard
        icon={Shield}
        label="Security Score"
        value={scoreValue}
        color={scoreColor}
        sub={securityScore ? `Grade: ${securityScore.grade}` : 'Add items to score'}
      />
      <StatCard
        icon={Clock}
        label="Vault Status"
        value="Unlocked"
        color="var(--success)"
        sub={`Active at ${lastActive}`}
      />
    </div>
  );
});
StatsWidget.displayName = 'StatsWidget';
