import React, { memo } from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * WelcomeCard — reads only user.username from authStore via selector.
 * Never re-renders because vault or notification data changes.
 */
export const WelcomeCard = memo(() => {
  const username = useAuthStore(state => state.user?.username);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
          {greeting}, <span className="text-[var(--accent)]">{username}</span> 
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{today}</p>
      </div>
    </div>
  );
});
WelcomeCard.displayName = 'WelcomeCard';
