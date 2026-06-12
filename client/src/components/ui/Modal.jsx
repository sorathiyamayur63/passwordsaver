import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  size = 'md', 
  children, 
  footer 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'relative w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden',
            sizes[size]
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
              {description && <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] shrink-0 flex justify-end gap-3 rounded-b-xl">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};