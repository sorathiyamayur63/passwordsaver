import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { useVaultStore } from '../../store/vaultStore';
import { ItemTypeIcon } from '../vault/ItemTypeIcon';
import { Badge } from '../ui';

// Zustand store for Global Search Modal State
export const useSearchStore = create((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen }))
}));

export const GlobalSearch = () => {
  const { isOpen, closeSearch } = useSearchStore();
  const { items } = useVaultStore();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  
  const results = React.useMemo(() => {
    if (!query.trim()) return items.slice(0, 5); // Recent items fallback
    
    const lowerQuery = query.toLowerCase();
    
    // Fuzzy matching logic: All characters in query must appear in target in order
    const fuzzyMatch = (target, search) => {
      let tIdx = 0, sIdx = 0;
      while (tIdx < target.length && sIdx < search.length) {
        if (target[tIdx] === search[sIdx]) sIdx++;
        tIdx++;
      }
      return sIdx === search.length;
    };

    return items.filter(item => {
      const data = item.decryptedData;
      if (!data) return false;
      const searchableStr = `${data.title || ''} ${item.itemType} ${item.tags?.join(' ') || ''}`.toLowerCase();
      return fuzzyMatch(searchableStr, lowerQuery);
    }).slice(0, 20); // Cap at 20

  }, [query, items]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().toggleSearch();
      }
      
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        closeSearch();
        const path = window.location.pathname === '/dashboard' || window.location.pathname === '/vault' 
          ? `?item=${results[selectedIndex].uuid}` 
          : `/vault?item=${results[selectedIndex].uuid}`;
        navigate(path);
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, closeSearch, navigate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm"
          onClick={closeSearch}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
          className="relative w-full max-w-[600px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center px-4 border-b border-[var(--border)] shrink-0 h-14">
            <Search className="h-5 w-5 text-[var(--text-muted)] shrink-0" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0"
              placeholder="Search your vault... "
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]">
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 ml-2 px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-secondary)] text-[10px] font-mono text-[var(--text-muted)]">
              <span>ESC</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query && results.length > 0 && (
              <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Recently Added</div>
            )}
            
            {results.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                No vault items match "{query}"
              </div>
            ) : (
              results.map((item, idx) => (
                <div
                  key={item.uuid}
                  onClick={() => { 
                    closeSearch(); 
                    const path = window.location.pathname === '/dashboard' || window.location.pathname === '/vault' 
                      ? `?item=${item.uuid}` 
                      : `/vault?item=${item.uuid}`;
                    navigate(path);
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-[var(--accent-subtle)] border border-[var(--border-focus)]' : 'border border-transparent hover:bg-[var(--bg-secondary)]'}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${idx === selectedIndex ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                    <ItemTypeIcon type={item.itemType} className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${idx === selectedIndex ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {item.decryptedData?.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {item.decryptedData?.username || item.decryptedData?.website || 'Secured Item'}
                    </p>
                  </div>
                  <Badge variant="default" size="sm">{item.itemType.replace('_', ' ')}</Badge>
                </div>
              ))
            )}
          </div>
          
          <div className="h-10 px-4 bg-[var(--bg-secondary)] border-t border-[var(--border)] shrink-0 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <div className="flex gap-4">
              <span><kbd className="font-mono bg-[var(--bg-tertiary)] border border-[var(--border)] px-1 rounded mx-0.5">↑↓</kbd> to navigate</span>
              <span><kbd className="font-mono bg-[var(--bg-tertiary)] border border-[var(--border)] px-1 rounded mx-0.5">↵</kbd> to select</span>
            </div>
            <span>End-to-end encrypted search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};