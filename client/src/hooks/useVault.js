import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vaultApi } from '../services/vaultApi';
import { useVaultStore } from '../store/vaultStore';
import { getKey, getLegacyKey, encryptVaultItem, decryptVaultItem } from '../crypto';
import toast from 'react-hot-toast';

export const useVault = () => {
  const navigate = useNavigate();
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

  // const fetchItems = async (params = {}) => {
  //   try {
  //     store.setLoading(true);
  //     const res = await vaultApi.getVaultItems(params);
  //     const decryptedItems = await decryptItems(res.data.items);
  //     store.setItems(decryptedItems);
  //   } catch (err) {
  //     toast.error('Failed to load vault items');
  //   } finally {
  //     store.setLoading(false);
  //   }
  // };
const fetchItems = useCallback(async (params = {}) => {
  try {
    store.setLoading(true);
    const res = await vaultApi.getVaultItems(params);
    const decryptedItems = await decryptItems(res.data.items);
    store.setItems(decryptedItems);
  } catch (err) {
    toast.error('Failed to load vault items');
  } finally {
    store.setLoading(false);
  }
}, []);


  // const fetchCategories = async () => {
  //   try {
  //     const res = await vaultApi.getCategories();
  //     store.setCategories(res.data.categories);
  //   } catch (err) {
  //     // Background fetch, omit noisy errors
  //   }
  // };

  const fetchCategories = useCallback(async () => {
  try {
    const res = await vaultApi.getCategories();
    store.setCategories(res.data.categories);
  } catch (err) {}
}, []);

  const createItem = async (itemData, itemType, categoryUuid) => {
    try {
      const key = getKey();
      const encryptedFields = await encryptVaultItem(itemData, key);
      
      const payload = {
        ...encryptedFields,
        itemType,
        categoryUuid,
        templateUuid: itemData.templateUuid,
        tags: itemData.tags || []
      };

      const res = await vaultApi.createVaultItem(payload);
      const newItem = { ...res.data.item, decryptedData: itemData };
      store.addItem(newItem);
      toast.success('Item added securely');
      return true;
    } catch (err) {
      if (!handleCryptoError(err)) toast.error(err.message || 'Failed to add item');
      return false;
    }
  };

  const updateItem = async (uuid, itemData, categoryUuid) => {
    try {
      const key = getKey();
      const encryptedFields = await encryptVaultItem(itemData, key);
      
      const payload = { ...encryptedFields, categoryUuid };
      const res = await vaultApi.updateVaultItem(uuid, payload);
      
      store.updateItem(uuid, { ...res.data.item, decryptedData: itemData });
      toast.success('Item updated');
      return true;
    } catch (err) {
      if (!handleCryptoError(err)) toast.error(err.message || 'Failed to update item');
      return false;
    }
  };

  const toggleFavorite = async (item) => {
    // Optimistic UI update
    store.updateItem(item.uuid, { isFavorite: !item.isFavorite });
    try {
      await vaultApi.toggleFavorite(item.uuid);
    } catch (err) {
      store.updateItem(item.uuid, { isFavorite: item.isFavorite }); // Revert
      toast.error('Failed to update favorite status');
    }
  };

  const deleteItem = async (uuid) => {
    store.removeItem(uuid); // Optimistic
    try {
      await vaultApi.deleteVaultItem(uuid);
      
      toast.success('Moved to trash');
    } catch (err) {
      fetchItems(); // Revert on failure
      toast.error('Failed to delete item');
    }
  };

  return {
    ...store,
    fetchItems,
    fetchCategories,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    decryptItems
  };
};