import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Input } from './Input';
import { cn } from '../../utils/cn';

export const PasswordInput = forwardRef(({ showCopy = false, value, onChange, className, ...rest }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleShow = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleCopy = async (e) => {
    e.preventDefault();
    if (!value) return;
    
    await navigator.clipboard.writeText(value);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);

    // Security: Clear clipboard after 30 seconds
    setTimeout(async () => {
      try {
        const currentClip = await navigator.clipboard.readText();
        if (currentClip === value) {
          await navigator.clipboard.writeText('');
        }
      } catch (err) {
        // Ignore clipboard read errors
      }
    }, 30000);
  };

  const buttonCount = showCopy ? 2 : 1;
  const rightPadding = buttonCount === 2 ? 'pr-20' : 'pr-12';

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      className={cn(rightPadding, className)}
      rightElement={
        <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-3 pointer-events-none">
          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className="pointer-events-auto p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus:outline-none transition-colors"
              title="Copy"
            >
              {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={toggleShow}
            className="pointer-events-auto p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus:outline-none transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      }
      {...rest}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';