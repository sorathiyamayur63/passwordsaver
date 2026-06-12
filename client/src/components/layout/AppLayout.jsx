import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-tertiary)] overflow-hidden">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-64 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

<main className="flex-1 overflow-y-auto p-4 md:p-8 app-scrollbar">          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};