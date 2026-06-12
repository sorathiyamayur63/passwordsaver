import React, { useMemo } from 'react';
import { cn } from '../../utils/cn';

export const PasswordStrength = ({ password }) => {
  const analysis = useMemo(() => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const length = password.length;

    let score = 0;
    
    if (length > 0) {
      if (length < 6) score = 0;
      else if (length < 8) score = 1;
      else if (length >= 8 && ((hasLower && !hasUpper && !hasNumber) || (hasNumber && !hasLower && !hasUpper))) score = 1;
      else if (length >= 8 && hasLower && hasUpper && !hasNumber) score = 2;
      else if (length >= 8 && ((hasLower || hasUpper) && hasNumber)) score = 2;
      else if (length >= 10 && hasLower && hasUpper && hasNumber && !hasSpecial) score = 3;
      else if (length >= 12 && hasLower && hasUpper && hasNumber && hasSpecial) score = 4;
      
      const commonPenalties = ['password', '123456', 'qwerty', 'admin'];
      const lowerPass = password.toLowerCase();
      if (commonPenalties.some(p => lowerPass.includes(p))) {
        score = Math.max(0, score - 2);
      }
    }

    const entropyBits = Math.floor(length * Math.log2((hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSpecial ? 32 : 0) || 1));

    const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
    
    return {
      score,
      label: labels[score] || "Very Weak",
      entropy: entropyBits,
      reqs: {
        length: length >= 8,
        upper: hasUpper,
        lower: hasLower,
        number: hasNumber,
        special: hasSpecial
      }
    };
  }, [password]);

  const getSegmentColor = (index, score) => {
    if (index > score) return 'bg-[var(--border)]';
    if (score === 0 || score === 1) return 'bg-[var(--danger)]';
    if (score === 2) return 'bg-[var(--warning)]';
    return 'bg-[var(--success)]';
  };

  return (
    <div className="w-full mt-2 space-y-2">
      <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn('flex-1 transition-colors duration-300', getSegmentColor(index, analysis.score))}
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className={cn(
          "font-medium",
          analysis.score <= 1 ? "text-[var(--danger)]" : analysis.score === 2 ? "text-[var(--warning)]" : "text-[var(--success)]"
        )}>
          {password ? analysis.label : "Enter password"}
        </span>
        <span className="text-[var(--text-muted)]">
          {password ? `(~${analysis.entropy} bits)` : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs">
        <ReqItem met={analysis.reqs.length} text="8+ characters" />
        <ReqItem met={analysis.reqs.upper} text="Uppercase letter" />
        <ReqItem met={analysis.reqs.lower} text="Lowercase letter" />
        <ReqItem met={analysis.reqs.number} text="Number" />
        <ReqItem met={analysis.reqs.special} text="Special character" />
      </div>
    </div>
  );
};

const ReqItem = ({ met, text }) => (
  <div className={cn("flex items-center gap-1.5 transition-colors", met ? "text-[var(--success)]" : "text-[var(--text-muted)]")}>
    <span className="text-sm font-bold leading-none mb-0.5">{met ? '✓' : '•'}</span>
    <span>{text}</span>
  </div>
);