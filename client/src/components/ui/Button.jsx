import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] border border-transparent shadow-sm',
  secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border)] shadow-sm',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] border border-transparent',
  danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] border border-transparent shadow-sm',
  outline: 'bg-transparent text-[var(--accent)] border border-[var(--accent)] hover:bg-[var(--accent-subtle)]'
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2 text-sm',
  lg: 'h-12 px-8 text-base'
};

export const Button = forwardRef(({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  leftIcon: LeftIcon, 
  rightIcon: RightIcon, 
  children, 
  className, 
  ...rest 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && LeftIcon && <LeftIcon className="mr-2 h-4 w-4" />}
      {children}
      {!loading && RightIcon && <RightIcon className="ml-2 h-4 w-4" />}
    </button>
  );
});

Button.displayName = 'Button';