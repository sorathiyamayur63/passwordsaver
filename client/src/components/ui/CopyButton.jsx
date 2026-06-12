import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

export const CopyButton = ({ value, label = "Copy", timeout = 30000, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;

    await navigator.clipboard.writeText(value);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

    setTimeout(async () => {
      try {
        const currentClip = await navigator.clipboard.readText();
        if (currentClip === value) {
          await navigator.clipboard.writeText('');
        }
      } catch (err) {}
    }, timeout);
  };

  return (
    <Tooltip content={copied ? "Copied!" : label} side="top">
      <button
        onClick={handleCopy}
        type="button"
        className={cn(
          "p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]",
          copied ? "text-[var(--success)] bg-[var(--success-subtle)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
          className
        )}
        aria-label={label}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </Tooltip>
  );
};