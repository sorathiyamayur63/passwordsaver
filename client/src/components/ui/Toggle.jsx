import React from 'react';
import { cn } from '../../utils/cn';

export const Toggle = ({ checked, onChange, label, disabled = false, size = 'md' }) => {
  return (
    <label className={cn(
      "inline-flex items-center cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          role="switch"
          aria-checked={checked}
        />
        <div className={cn(
          "block rounded-full transition-colors duration-200 ease-in-out border border-transparent",
          size === 'sm' ? "w-8 h-4" : "w-11 h-6",
          checked ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
        )}></div>
        <div className={cn(
          "absolute bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm",
          size === 'sm' ? "w-3 h-3 top-0.5 left-0.5" : "w-5 h-5 top-0.5 left-0.5",
          checked && (size === 'sm' ? "translate-x-4" : "translate-x-5")
        )}></div>
      </div>
      {label && <span className="ml-3 text-sm font-medium text-[var(--text-primary)]">{label}</span>}
    </label>
  );
};