import React from 'react';
import { Button } from './Button';

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="h-16 w-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4 border border-[var(--border)]">
          <Icon className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};