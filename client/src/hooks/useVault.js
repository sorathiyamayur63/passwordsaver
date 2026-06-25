import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaultApi } from '../services/vaultApi';
import { useVaultStore } from '../store/vaultStore';
import { getKey, getLegacyKey, encryptVaultItem, decryptVaultItem } from '../crypto';
import toast from 'react-hot-toast';

export const useVault = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const store = useVaultStore();

  const handleCryptoError = useCallback((err) => {
    if (err.message === 'VAULT_LOCKED') {
      navigate('/unlock', { state: { from: window.location.pathname } });
      return true;
    }
    return false;
  }, [navigate]);

  const decryptItems = async (items) => {
    try {
      const key = getKey();
      const legacyKey = getLegacyKey();
      return await Promise.all(items.map(async (item) => {
        try {
          const decryptedData = await decryptVaultItem(item, key, legacyKey);
          return { ...item, decryptedData };
        } catch (e) {
          return { ...item, decryptedData: { title: 'Decryption Error', _error: true } };
        }
      }));
    } catch (err) {
      if (!handleCryptoError(err)) throw err;
      return [];
    }
  };

  const { data: items = [], isLoading: itemsLoading, isFetching, refetch: fetchItems } = useQuery({
    queryKey: ['vaultItems'],
    queryFn: async () => {
      const res = await vaultApi.getVaultItems();
      const decrypted = await decryptItems(res.data.items);
      store.setItems(decrypted); // Sync with store for legacy consumers
      return decrypted;
    },
    staleTime: 5 * 60 * 1000,
    onError: () => toast.error('Failed to load vault items')
  });

  const { data: categories = [], refetch: fetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await vaultApi.getCategories();
      store.setCategories(res.data.categories); // Sync with store
      return res.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async ({ itemData, itemType, categoryUuid }) => {
      const key = getKey();
      const encryptedFields = await encryptVaultItem(itemData, key);
      const payload = {
        ...encryptedFields,
        itemType,
        categoryUuid,
        templateUuid: itemData.templateUuid,
        tags: itemData.tags || [],
        personUuid: itemData.personUuid || null,
        groupUuid: itemData.groupUuid || null
      };
      const res = await vaultApi.createVaultItem(payload);
      return { ...res.data.item, decryptedData: itemData };
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData(['vaultItems'], old => [newItem, ...(old || [])]);
      store.addItem(newItem);
      toast.success('Item added securely');
    },
    onError: (err) => {
      if (!handleCryptoError(err)) toast.error(err.message || 'Failed to add item');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ uuid, itemData, categoryUuid }) => {
      const key = getKey();
      const encryptedFields = await encryptVaultItem(itemData, key);
      const payload = { ...encryptedFields, categoryUuid };
      const res = await vaultApi.updateVaultItem(uuid, payload);
      return { ...res.data.item, decryptedData: itemData };
    },
    onSuccess: (updatedItem, { uuid }) => {
      queryClient.setQueryData(['vaultItems'], old => old?.map(item => item.uuid === uuid ? updatedItem : item));
      store.updateItem(uuid, updatedItem);
      toast.success('Item updated');
    },
    onError: (err) => {
      if (!handleCryptoError(err)) toast.error(err.message || 'Failed to update item');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid) => vaultApi.deleteVaultItem(uuid),
    onMutate: async (uuid) => {
      await queryClient.cancelQueries(['vaultItems']);
      const previous = queryClient.getQueryData(['vaultItems']);
      queryClient.setQueryData(['vaultItems'], old => old?.filter(item => item.uuid !== uuid));
      store.removeItem(uuid);
      return { previous };
    },
    onSuccess: () => toast.success('Moved to trash'),
    onError: (err, uuid, context) => {
      queryClient.setQueryData(['vaultItems'], context.previous);
      store.setItems(context.previous);
      toast.error('Failed to delete item');
    },
    onSettled: () => queryClient.invalidateQueries(['vaultItems'])
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (uuid) => vaultApi.toggleFavorite(uuid),
    onMutate: async (uuid) => {
      await queryClient.cancelQueries(['vaultItems']);
      const previous = queryClient.getQueryData(['vaultItems']);
      queryClient.setQueryData(['vaultItems'], old => old?.map(item => item.uuid === uuid ? { ...item, isFavorite: !item.isFavorite } : item));
      store.updateItem(uuid, { isFavorite: !previous?.find(i => i.uuid === uuid)?.isFavorite });
      return { previous, uuid };
    },
    onError: (err, uuid, context) => {
      queryClient.setQueryData(['vaultItems'], context.previous);
      const prevItem = context.previous?.find(i => i.uuid === uuid);
      if (prevItem) store.updateItem(uuid, { isFavorite: prevItem.isFavorite });
      toast.error('Failed to update favorite status');
    },
    onSettled: () => queryClient.invalidateQueries(['vaultItems'])
  });

  return {
    ...store,
    items,
    categories,
    isLoading: itemsLoading, // Export React Query loading state directly
    isFetching,
    fetchItems: async () => { await fetchItems(); },
    fetchCategories: async () => { await fetchCategories(); },
    createItem: async (itemData, itemType, categoryUuid) => {
      try {
        await createMutation.mutateAsync({ itemData, itemType, categoryUuid });
        return true;
      } catch { return false; }
    },
    updateItem: async (uuid, itemData, categoryUuid) => {
      try {
        await updateMutation.mutateAsync({ uuid, itemData, categoryUuid });
        return true;
      } catch { return false; }
    },
    deleteItem: (uuid) => deleteMutation.mutate(uuid),
    toggleFavorite: (item) => toggleFavoriteMutation.mutate(item.uuid),
    decryptItems
  };
};