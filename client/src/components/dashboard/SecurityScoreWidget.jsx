import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card, Button } from '../ui';
import { useVaultStore } from '../../store/vaultStore';
import { calculateVaultHealthScore } from '../../utils/securityAnalysis';
import { cn } from '../../utils/cn';

/**
 * SecurityScoreWidget — computes real security score from cached vault items.
 * No API call needed. Links to Security Center for full analysis.
 */
export const SecurityScoreWidget = memo(() => {
  const items = useVaultStore(state => state.items);
  const navigate = useNavigate();

  const report = useMemo(() => calculateVaultHealthScore(items || []), [items]);

  const scoreColor = report.grade === 'N/A'
    ? 'text-[var(--text-muted)] border-[var(--border)]'
    : report.score >= 80
      ? 'text-[var(--success)] border-[var(--success)]'
      : report.score >= 60
        ? 'text-[var(--warning)] border-[var(--warning)]'
        : 'text-[var(--danger)] border-[var(--danger)]';

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Security Score</h2>
      <Card padding="md" className="flex flex-col items-center gap-4">
        <div className={cn('flex items-center justify-center h-24 w-24 rounded-full border-[6px] shrink-0', scoreColor)}>
          <div className="text-center">
            <span className="text-2xl font-bold leading-none">{report.grade === 'N/A' ? '—' : report.score}</span>
            {report.grade !== 'N/A' && <p className="text-xs font-semibold">/ 100</p>}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {report.grade === 'N/A' ? 'No data yet' : `Grade: ${report.grade}`}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
            {report.recommendations[0]}
          </p>
        </div>

        {report.grade !== 'N/A' && (
          <div className="w-full space-y-2 border-t border-[var(--border)] pt-3">
            {[
              { label: 'Weak', count: report.raw?.passStrength?.summary?.weakCount || 0, color: 'var(--danger)' },
              { label: 'Reused', count: report.raw?.reused?.length || 0, color: 'var(--warning)' },
              { label: 'Old', count: report.raw?.old?.length || 0, color: 'var(--accent)' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">{row.label} passwords</span>
                <span
                  className="font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: row.color,
                    backgroundColor: row.color + '20'
                  }}
                >
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => navigate('/security')}
        >
          Full Security Report
        </Button>
      </Card>
    </div>
  );
});
SecurityScoreWidget.displayName = 'SecurityScoreWidget';
