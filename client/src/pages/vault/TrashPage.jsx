import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, RefreshCcw, ShieldAlert } from 'lucide-react';
import { Button, Card, EmptyState, Spinner, Badge } from '../../components/ui';
import { vaultApi } from '../../services/vaultApi';
import { decryptVaultItem, getKey } from '../../crypto';
import { ItemTypeIcon } from '../../components/vault/ItemTypeIcon';
import toast from 'react-hot-toast';

export const TrashPage = () => {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const res = await vaultApi.getTrashItems();
      const key = getKey();
      
      // Decrypt items locally
      const decrypted = await Promise.all(res.data.items.map(async (item) => {
        try {
          const decryptedData = await decryptVaultItem(item, key);
          return { ...item, decryptedData };
        } catch (e) {
          return { ...item, decryptedData: { title: 'Decryption Error' } };
        }
      }));
      setTrashItems(decrypted);
    } catch (err) {
      toast.error('Failed to load trash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (uuid) => {
    setActionLoading(true);
    try {
      await vaultApi.restoreVaultItem(uuid);
      setTrashItems(prev => prev.filter(i => i.uuid !== uuid));
      toast.success('Item restored to vault');
    } catch (err) {
      toast.error('Failed to restore item');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (uuid) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await vaultApi.permanentDeleteVaultItem(uuid);
      setTrashItems(prev => prev.filter(i => i.uuid !== uuid));
      toast.success('Item permanently deleted');
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to empty the trash? All items will be permanently destroyed.')) return;
    setActionLoading(true);
    try {
      await vaultApi.emptyTrash();
      setTrashItems([]);
      toast.success('Trash emptied successfully');
    } catch (err) {
      toast.error('Failed to empty trash');
    } finally {
      setActionLoading(false);
    }
  };

  // Loader moved inline

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trash Bin</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Items here are permanently deleted after 30 days.</p>
        </div>
        <Button variant="danger" leftIcon={Trash2} onClick={handleEmptyTrash} disabled={trashItems.length === 0 || actionLoading}>
          Empty Trash
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : trashItems.length === 0 ? (
        <EmptyState 
          icon={ShieldAlert} 
          title="Trash is empty" 
          description="Deleted vault items will appear here." 
        />
      ) : (
        <div className="divide-y divide-[var(--border)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg overflow-hidden">
          {trashItems.map(item => (
            <div key={item.uuid} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <ItemTypeIcon type={item.itemType} className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] strike-through">
                    {item.decryptedData?.title || 'Untitled'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="danger" size="sm">Deleted</Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" leftIcon={RefreshCcw} onClick={() => handleRestore(item.uuid)} disabled={actionLoading}>
                  Restore
                </Button>
                <Button variant="danger" size="sm" onClick={() => handlePermanentDelete(item.uuid)} disabled={actionLoading}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};