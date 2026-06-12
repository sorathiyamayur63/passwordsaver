import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // MUST BE TRUE by default for initial AuthGuard check
      error: null,
      savedUsername: '',
      
      setUser: (user) => set({ user, isAuthenticated: true, error: null }),
      clearUser: () => set({ user: null, isAuthenticated: false, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSavedUsername: (username) => set({ savedUsername: username })
    }),
    {
      name: 'passwordsaver-auth',
      storage: createJSONStorage(() => localStorage),
      // ONLY persist the saved username for UX purposes. NEVER tokens or passwords.
      partialize: (state) => ({ savedUsername: state.savedUsername })
    }
  )
);