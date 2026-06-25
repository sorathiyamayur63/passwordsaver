import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '../services/groupApi';
import toast from 'react-hot-toast';

export const useGroupsQuery = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupApi.getGroups().then(res => res.data.groups),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGroupDetailQuery = (groupUuid) => {
  return useQuery({
    queryKey: ['groups', groupUuid],
    queryFn: () => groupApi.getPeople(groupUuid).then(res => ({
      group: res.data.group,
      people: res.data.persons
    })),
    staleTime: 5 * 60 * 1000,
    enabled: !!groupUuid,
  });
};

export const useGroupMutations = () => {
  const queryClient = useQueryClient();

  const createGroup = useMutation({
    mutationFn: (data) => groupApi.createGroup(data),
    onSuccess: () => {
      toast.success('Group created');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to create group'),
  });

  const updateGroup = useMutation({
    mutationFn: ({ uuid, data }) => groupApi.updateGroup(uuid, data),
    onSuccess: () => {
      toast.success('Group updated');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update group'),
  });

  const deleteGroup = useMutation({
    mutationFn: (uuid) => groupApi.deleteGroup(uuid),
    onSuccess: () => {
      toast.success('Group deleted');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to delete group'),
  });

  const reorderGroups = useMutation({
    mutationFn: (orderings) => groupApi.reorderGroups(orderings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
    onError: () => toast.error('Failed to reorder groups'),
  });

  return {
    createGroup: async (data) => { await createGroup.mutateAsync(data); return true; },
    updateGroup: async (uuid, data) => { await updateGroup.mutateAsync({ uuid, data }); return true; },
    deleteGroup: async (uuid) => { await deleteGroup.mutateAsync(uuid); return true; },
    reorderGroups: async (orderings) => { await reorderGroups.mutateAsync(orderings); return true; }
  };
};

export const usePeopleMutations = (groupUuid) => {
  const queryClient = useQueryClient();

  const createPerson = useMutation({
    mutationFn: (data) => groupApi.createPerson(groupUuid, data),
    onSuccess: () => {
      toast.success('Person added');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupUuid] });
    },
    onError: (err) => toast.error(err.message || 'Failed to add person'),
  });

  const updatePerson = useMutation({
    mutationFn: ({ uuid, data }) => groupApi.updatePerson(groupUuid, uuid, data),
    onSuccess: () => {
      toast.success('Person updated');
      queryClient.invalidateQueries({ queryKey: ['groups', groupUuid] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update person'),
  });

  const deletePerson = useMutation({
    mutationFn: (uuid) => groupApi.deletePerson(groupUuid, uuid),
    onSuccess: () => {
      toast.success('Person deleted');
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', groupUuid] });
    },
    onError: (err) => toast.error(err.message || 'Failed to delete person'),
  });

  const reorderPeople = useMutation({
    mutationFn: (orderings) => groupApi.reorderPeople(groupUuid, orderings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupUuid] }),
    onError: () => toast.error('Failed to reorder people'),
  });

  const toggleFavPerson = useMutation({
    mutationFn: (personUuid) => groupApi.toggleFavPerson(groupUuid, personUuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupUuid] }),
    onError: () => toast.error('Failed to update favorite status'),
  });

  return {
    createPerson: async (data) => { await createPerson.mutateAsync(data); return true; },
    updatePerson: async (uuid, data) => { await updatePerson.mutateAsync({ uuid, data }); return true; },
    deletePerson: async (uuid) => { await deletePerson.mutateAsync(uuid); return true; },
    reorderPeople: async (orderings) => { await reorderPeople.mutateAsync(orderings); return true; },
    toggleFavPerson: async (person) => { await toggleFavPerson.mutateAsync(person.uuid); return true; }
  };
};
