import { create } from 'zustand';

export const useVaultStore = create((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,
  error: null,
  
  // Data freshness tracking — avoids redundant fetch+decrypt on every page nav
  _lastFetchedAt: 0,
  _categoriesFetchedAt: 0,
  
  viewMode: 'list',
  sortBy: 'lastModifiedAt',
  searchQuery: '',
  
  setItems: (items) => set({ items, _lastFetchedAt: Date.now() }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (uuid, updatedItem) => set((state) => ({
    items: state.items.map(item => item.uuid === uuid ? { ...item, ...updatedItem } : item)
  })),
  removeItem: (uuid) => set((state) => ({
    items: state.items.filter(item => item.uuid !== uuid)
  })),
  
  setCategories: (categories) => set({ categories, _categoriesFetchedAt: Date.now() }),
  
  // Check if data is fresh (fetched within the last N ms)
  isDataFresh: (maxAgeMs = 30000) => {
    const { _lastFetchedAt } = get();
    return _lastFetchedAt > 0 && (Date.now() - _lastFetchedAt) < maxAgeMs;
  },
  isCategoriesFresh: (maxAgeMs = 60000) => {
    const { _categoriesFetchedAt } = get();
    return _categoriesFetchedAt > 0 && (Date.now() - _categoriesFetchedAt) < maxAgeMs;
  },
  
  // Force invalidation when data changes (create/update/delete)
  invalidate: () => set({ _lastFetchedAt: 0 }),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  setViewMode: (viewMode) => set({ viewMode }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery })
}));