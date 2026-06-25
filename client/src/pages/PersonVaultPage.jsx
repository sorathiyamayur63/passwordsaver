import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, ChevronRight, ArrowLeft, LayoutGrid, List as ListIcon, Search, Shield } from 'lucide-react';
import { Button, Spinner, Card } from '../components/ui';
import { VaultItemCard } from '../components/vault/VaultItemCard';
import { VaultItemModal } from '../components/vault/VaultItemModal';
import { CreateItemModal } from '../components/vault/CreateItemModal';
import { vaultApi } from '../services/vaultApi';
import { groupApi } from '../services/groupApi';
import { useVault } from '../hooks/useVault';
import { getKey, getLegacyKey, decryptVaultItem } from '../crypto';
import toast from 'react-hot-toast';

export const PersonVaultPage = () => {
  const { groupUuid, personUuid } = useParams();
  const navigate = useNavigate();
  const { updateItem, fetchCategories: storeFetchCategories, categories: storeCategories } = useVault();

  // Local state — keeps person items separate from the main vault store
  const [items, setItems] = useState([]);
  const [personInfo, setPersonInfo] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const decryptItems = useCallback(async (rawItems) => {
    try {
      const key = getKey();
      const legacyKey = getLegacyKey();
      return await Promise.all(rawItems.map(async (item) => {
        try {
          const decryptedData = await decryptVaultItem(item, key, legacyKey);
          return { ...item, decryptedData };
        } catch {
          return { ...item, decryptedData: { title: 'Decryption Error', _error: true } };
        }
      }));
    } catch (err) {
      if (err.message === 'VAULT_LOCKED') {
        navigate('/unlock', { state: { from: window.location.pathname } });
      }
      return [];
    }
  }, [navigate]);

  const fetchPersonItems = useCallback(async () => {
    try {
      const res = await vaultApi.getVaultItems({ personUuid });
      const decrypted = await decryptItems(res.data.items);
      setItems(decrypted);
    } catch {
      toast.error('Failed to load vault items');
    }
  }, [personUuid, decryptItems]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const personRes = await groupApi.getPerson(groupUuid, personUuid);
        setPersonInfo(personRes.data.person);
        setGroupInfo(personRes.data.group);
        
        // Load categories into the vault store (VaultItemModal reads from there)
        await storeFetchCategories();
        
        await fetchPersonItems();
      } catch {
        toast.error('Failed to load person data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupUuid, personUuid]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => {
      const d = item.decryptedData;
      if (!d) return false;
      return (
        (d.title && d.title.toLowerCase().includes(q)) ||
        (d.username && d.username.toLowerCase().includes(q)) ||
        (d.website && d.website.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q))
      );
    });
  }, [items, searchQuery]);

  const handleToggleFavorite = async (item) => {
    // Optimistic update
    setItems(prev => prev.map(i =>
      i.uuid === item.uuid ? { ...i, isFavorite: !i.isFavorite } : i
    ));
    try {
      await vaultApi.toggleFavorite(item.uuid);
    } catch {
      setItems(prev => prev.map(i =>
        i.uuid === item.uuid ? { ...i, isFavorite: item.isFavorite } : i
      ));
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteItem = async (uuid) => {
    setItems(prev => prev.filter(i => i.uuid !== uuid));
    try {
      await vaultApi.deleteVaultItem(uuid);
      toast.success('Moved to trash');
    } catch {
      fetchPersonItems();
      toast.error('Failed to delete item');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm flex-wrap">
        <Link to="/groups" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Groups</Link>
        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        <Link to={`/groups/${groupUuid}`} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
          {groupInfo?.name || 'Group'}
        </Link>
        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="font-medium text-[var(--text-primary)]">{personInfo?.fullName || 'Person'}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/groups/${groupUuid}`)}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: groupInfo?.color || '#6366f1' }}
          >
            {getInitials(personInfo?.fullName)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">{personInfo?.fullName}</h1>
            {personInfo?.nickname && (
              <p className="text-sm text-[var(--text-muted)]">"{personInfo.nickname}"</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>

      {/* Search */}
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search vault items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
          />
        </div>
      )}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            {searchQuery ? 'No results found' : 'No vault items yet'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {searchQuery
              ? `No items match "${searchQuery}"`
              : `Store passwords, cards, and notes for ${personInfo?.fullName}.`
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add First Item
            </Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-2'
        }>
          {filteredItems.map(item => (
            <VaultItemCard
              key={item.uuid}
              item={item}
              viewMode={viewMode}
              onClick={() => setSelectedItem(item)}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          ))}
        </div>
      )}

      {/* View/Edit Item Modal */}
      {selectedItem && (
        <VaultItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={async (uuid, formData, catUuid) => {
            const success = await updateItem(uuid, formData, catUuid);
            if (success) {
              setSelectedItem(null);
              await fetchPersonItems();
            }
            return success;
          }}
          onDelete={async (uuid) => {
            await handleDeleteItem(uuid);
            setSelectedItem(null);
          }}
          categories={storeCategories}
        />
      )}

      {/* Create Item Modal — passes personUuid/groupUuid for person-scoped creation */}
      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchPersonItems();
        }}
        personUuid={personUuid}
        groupUuid={groupUuid}
      />
      </>
      )}
    </div>
  );
};
