import React from 'react';
import { cn } from '../../utils/cn';

const variants = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)]',
  success: 'bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success)]',
  warning: 'bg-[var(--warning-subtle)] text-[var(--warning-text)] border border-[var(--warning)]',
  danger: 'bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger)]',
  info: 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent)]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs'
};

export const Badge = ({ variant = 'default', size = 'md', className, children }) => {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};