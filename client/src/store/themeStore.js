import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: 'system',
  resolvedTheme: 'dark',
  
  initTheme: () => {
    const savedTheme = localStorage.getItem('passwordsaver-theme') || 'system';
    get().setTheme(savedTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (get().theme === 'system') {
        get().applyTheme('system');
      }
    });
  },

  setTheme: (theme) => {
    localStorage.setItem('passwordsaver-theme', theme);
    set({ theme });
    get().applyTheme(theme);
  },

  applyTheme: (theme) => {
    const root = window.document.documentElement;
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    set({ resolvedTheme: isDark ? 'dark' : 'light' });
  }
}));

export const useTheme = () => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(next);
  };

  return { 
    theme, 
    resolvedTheme, 
    setTheme, 
    toggleTheme,
    isDark: resolvedTheme === 'dark' 
  };
};