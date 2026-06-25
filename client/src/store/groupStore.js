import { create } from 'zustand';

export const useGroupStore = create((set, get) => ({
  groups: [],
  people: [],
  currentGroup: null,
  currentPerson: null,
  isLoading: false,
  error: null,

  // Data freshness tracking
  _groupsFetchedAt: 0,
  _peopleFetchedAt: 0,
  _peopleFetchedForGroup: null,

  setGroups: (groups) => set({ groups, _groupsFetchedAt: Date.now() }),
  setPeople: (people, groupUuid) => set({ 
    people, 
    _peopleFetchedAt: Date.now(),
    _peopleFetchedForGroup: groupUuid 
  }),
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setCurrentPerson: (person) => set({ currentPerson: person }),

  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (uuid, data) => set((state) => ({
    groups: state.groups.map(g => g.uuid === uuid ? { ...g, ...data } : g)
  })),
  removeGroup: (uuid) => set((state) => ({
    groups: state.groups.filter(g => g.uuid !== uuid)
  })),

  addPerson: (person) => set((state) => ({ people: [...state.people, person] })),
  updatePerson: (uuid, data) => set((state) => ({
    people: state.people.map(p => p.uuid === uuid ? { ...p, ...data } : p)
  })),
  removePerson: (uuid) => set((state) => ({
    people: state.people.filter(p => p.uuid !== uuid)
  })),

  isGroupsFresh: (maxAgeMs = 30000) => {
    const { _groupsFetchedAt } = get();
    return _groupsFetchedAt > 0 && (Date.now() - _groupsFetchedAt) < maxAgeMs;
  },
  isPeopleFresh: (groupUuid, maxAgeMs = 30000) => {
    const { _peopleFetchedAt, _peopleFetchedForGroup } = get();
    return (
      _peopleFetchedAt > 0 &&
      _peopleFetchedForGroup === groupUuid &&
      (Date.now() - _peopleFetchedAt) < maxAgeMs
    );
  },

  invalidateGroups: () => set({ _groupsFetchedAt: 0 }),
  invalidatePeople: () => set({ _peopleFetchedAt: 0, _peopleFetchedForGroup: null }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
