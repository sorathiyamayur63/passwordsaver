import React, { memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Fingerprint, Activity, Plus, Key, Users, Folder } from 'lucide-react';
import { Card } from '../ui';

const ACTIONS = [
  {
    icon: ShieldCheck,
    label: 'Open Vault',
    description: 'View all saved items',
    path: '/vault',
    color: 'var(--accent)'
  },
  {
    icon: Key,
    label: 'Generate Password',
    description: 'Create a strong password',
    path: '/generator',
    color: 'var(--success)'
  },
  {
    icon: Activity,
    label: 'Security Audit',
    description: 'Check vault health',
    path: '/security',
    color: 'var(--warning)',
    highlight: true
  },
  {
    icon: Folder,
    label: 'Categories',
    description: 'Organize your vault',
    path: '/categories',
    color: 'var(--purple, #8b5cf6)'
  },
  {
    icon: Users,
    label: 'Groups',
    description: 'Manage people & groups',
    path: '/groups',
    color: 'var(--cyan, #06b6d4)'
  },
];

/**
 * QuickActionsWidget — static actions, never re-renders from any store change.
 * Uses useCallback for navigation handler to maintain stable reference.
 */
export const QuickActionsWidget = memo(() => {
  const navigate = useNavigate();

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ACTIONS.map((action) => (
          <Card
            key={action.path}
            padding="md"
            hover
            clickable
            onClick={() => handleNavigate(action.path)}
            className={`text-center flex flex-col items-center justify-center gap-2 min-h-[90px] transition-all group ${
              action.highlight ? 'border-[var(--accent)] bg-[var(--bg-elevated)]' : ''
            }`}
          >
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: action.color + '20' }}
            >
              <action.icon className="h-5 w-5" style={{ color: action.color }} />
            </div>
            <div>
              <p className={`text-xs font-semibold ${action.highlight ? 'text-[var(--accent-text)]' : 'text-[var(--text-primary)]'}`}>
                {action.label}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
});
QuickActionsWidget.displayName = 'QuickActionsWidget';
