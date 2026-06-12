import { create } from 'zustand';

export const useVaultStore = create((set) => ({
  items: [],
  categories: [],
  isLoading: false,
  error: null,
  
  viewMode: 'list',
  sortBy: 'lastModifiedAt',
  searchQuery: '',
  
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (uuid, updatedItem) => set((state) => ({
    items: state.items.map(item => item.uuid === uuid ? { ...item, ...updatedItem } : item)
  })),
  removeItem: (uuid) => set((state) => ({
    items: state.items.filter(item => item.uuid !== uuid)
  })),
  
  setCategories: (categories) => set({ categories }),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  setViewMode: (viewMode) => set({ viewMode }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery })
}));