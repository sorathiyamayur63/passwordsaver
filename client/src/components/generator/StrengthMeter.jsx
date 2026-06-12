import React, { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { calculateStrength } from '../../utils/passwordUtils';
import { cn } from '../../utils/cn';

export const StrengthMeter = ({ password, showEntropy = true, showLabel = true }) => {
  const strength = useMemo(() => calculateStrength(password), [password]);

  const crackTime = useMemo(() => {
    if (!password) return 'Instant';
    // Assume 100 Billion guesses per second (Modern GPU cluster)
    const seconds = Math.pow(2, strength.entropy) / 100000000000;
    
    if (seconds < 1) return 'Instant';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    if (seconds < 3153600000000) return `${Math.round(seconds / 3153600000)} centuries`;
    return 'Theoretical Maximum (Eons)';
  }, [strength.entropy, password]);

  const segments = [0, 1, 2, 3, 4];

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-1.5 h-2 w-full rounded-full overflow-hidden bg-[var(--bg-secondary)]">
        {segments.map((index) => (
          <div
            key={index}
            className="flex-1 transition-colors duration-500 rounded-full"
            style={{ 
              backgroundColor: index <= strength.score ? strength.color : 'var(--border)' 
            }}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap justify-between items-start gap-2">
        {showLabel && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold transition-colors" style={{ color: strength.color }}>
              {password ? strength.label : 'Waiting...'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Estimated crack time: <span className="font-medium text-[var(--text-secondary)]">{crackTime}</span>
            </span>
          </div>
        )}
        
        {showEntropy && password && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-1 rounded border border-[var(--border)]">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: strength.color }} />
            <span>~{strength.entropy} bits</span>
          </div>
        )}
      </div>
    </div>
  );
};