import React from 'react';
import { cn } from '../../utils/cn';

const paddings = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const Card = ({ className, padding = 'md', hover = false, clickable = false, onClick, children, ...rest }) => {
  const Element = clickable || onClick ? 'button' : 'div';
  
  return (
    <Element
      onClick={onClick}
      className={cn(
        'w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-sm text-left',
        paddings[padding],
        hover && 'transition-colors hover:border-[var(--border-strong)] hover:shadow-md',
        (clickable || onClick) && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]',
        className
      )}
      {...rest}
    >
      {children}
    </Element>
  );
};