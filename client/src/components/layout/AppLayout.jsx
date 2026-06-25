import React, { useState, useCallback, memo } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Both Sidebar and Header are already memo() internally — no need to double-wrap
export const AppLayout = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCloseMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const handleOpenMobileMenu = useCallback(() => setMobileMenuOpen(true), []);

  return (
    <div className="flex h-screen bg-[var(--bg-tertiary)] overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm md:hidden"
          onClick={handleCloseMobileMenu}
        />
      )}

      {/* Sidebar — always mounted, never unmounts on route change */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-64 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={handleCloseMobileMenu} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header — always mounted, never unmounts on route change */}
        <Header onMenuClick={handleOpenMobileMenu} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 app-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Only the Outlet (page content) changes on navigation */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
});
AppLayout.displayName = 'AppLayout';