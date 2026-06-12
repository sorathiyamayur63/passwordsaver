import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Sun, Moon, Bell, User, LogOut, Settings, Shield, LockKeyhole } from 'lucide-react';
import { useTheme } from '../../store/themeStore';
import { useAuth } from '../../hooks/useAuth';
import { lockVault } from '../../crypto';

export const Header = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State to manage the dropdown menu visibility
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLockVault = () => {
    lockVault();
    navigate('/unlock');
  };

  return (
    <header className="h-[60px] bg-[var(--bg-elevated)] border-b border-[var(--border)] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Trigger */}
        <button 
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 w-64 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search vault...</span>
          <span className="ml-auto text-xs bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded border border-[var(--border)]">⌘K</span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <button
          onClick={() => navigate('/settings', { state: { tab: 'notifications' } })}
          className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors relative"
        >
          <Bell className="h-5 w-5" />
          {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full"></span> */}
        </button>

        {/* Clickable User Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="h-8 w-8 bg-[var(--accent-subtle)] rounded-full flex items-center justify-center border border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-shadow"
          >
            <span className="text-xs font-bold text-[var(--accent)] uppercase">
              {user?.username?.substring(0, 2)}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden animate-fadeIn z-50">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.username}</p>
              </div>
              
              <div className="p-1">
                <Link 
                  to="/profile" 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-md transition-colors"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button 
                  onClick={() => { setIsUserMenuOpen(false); handleLockVault(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--warning)] hover:bg-[var(--warning-subtle)] rounded-md transition-colors"
                >
                  <LockKeyhole className="h-4 w-4" /> Lock Vault
                </button>
              </div>

              <div className="p-1 border-t border-[var(--border)]">
                <button 
                  onClick={() => { setIsUserMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-subtle)] rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};