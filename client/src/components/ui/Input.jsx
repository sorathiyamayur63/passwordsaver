import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  rightElement,
  type = 'text',
  className,
  disabled,
  required,
  ...rest
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            LeftIcon && 'pl-9',
            RightIcon && 'pr-9',
            error && 'border-[var(--danger)] focus-visible:ring-[var(--danger)]',
            className
          )}
          {...rest}
        />
        {rightElement ? (
          rightElement
        ) : RightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <RightIcon className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        ) : null}
      </div>
      {error && <p className="mt-1.5 text-xs text-[var(--danger)]">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';