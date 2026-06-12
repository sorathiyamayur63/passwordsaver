import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List as ListIcon, Shield, X, Folder } from 'lucide-react';
import { Button, Input, EmptyState, Spinner, Badge } from '../../components/ui';
import { VaultItemCard } from '../../components/vault/VaultItemCard';
import { VaultItemModal } from '../../components/vault/VaultItemModal';
import { CreateItemModal } from '../../components/vault/CreateItemModal';
import { useVault } from '../../hooks/useVault';
import { templateApi } from '../../services/templateApi';
import { normalizeTemplate } from '../../utils/templateFields';

export const VaultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, isLoading, viewMode, setViewMode, searchQuery, setSearchQuery, fetchItems, fetchCategories, updateItem, deleteItem, toggleFavorite } = useVault();
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);
  
  // NEW: State to control the Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(location.state?.openCreateModal || false);
  const prefilledPassword = location.state?.prefilledPassword || '';
  const itemUuid = searchParams.get('item');
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await templateApi.getTemplates();
        const loadedTemplates = Array.isArray(res.data?.templates) ? res.data.templates : [];
        setCustomTemplates(loadedTemplates.filter(template => !template.isSystem).map(normalizeTemplate));
      } catch (error) {
        setCustomTemplates([]);
      }
    };

    loadTemplates();
  }, []);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    
    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('vault-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    if (!itemUuid || !items.length) return;
    const matchedItem = items.find(item => item.uuid === itemUuid);
    if (matchedItem) {
      setSelectedItem(matchedItem);
      setSearchParams({}, { replace: true });
    }
  }, [itemUuid, items, setSearchParams]);

  // Get the active category name for display
  const activeCategoryName = useMemo(() => {
    if (!categoryFilter) return null;
    if (categoryFilter === 'uncategorized') return 'Uncategorized';
    const cat = categories.find(c => c.uuid === categoryFilter);
    return cat?.name || null;
  }, [categoryFilter, categories]);

  // Client-Side Zero-Knowledge Search + Category Filter
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply category filter
    if (categoryFilter) {
      if (categoryFilter === 'uncategorized') {
        result = result.filter(item => !item.categoryUuid);
      } else {
        result = result.filter(item => item.categoryUuid === categoryFilter);
      }
    }

    // Apply search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(item => {
        const data = item.decryptedData;
        if (!data) return false;
        return Object.values(data).some(val => 
          typeof val === 'string' && val.toLowerCase().includes(lowerQ)
        );
      });
    }

    return result;
  }, [items, searchQuery, categoryFilter]);

  const clearCategoryFilter = () => {
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Vault</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{items.length} secured items</p>
        </div>
        
        {/* NEW: Button triggers the Create Modal */}
        <Button leftIcon={Plus} onClick={() => setIsCreateModalOpen(true)}>New Item</Button>
      </div>

      {/* Category Filter Banner */}
      {activeCategoryName && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)]" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
          <Folder className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--accent-text)]">
            Filtered by: <strong>{activeCategoryName}</strong>
          </span>
          <span className="text-xs text-[var(--text-muted)]">({filteredItems.length} items)</span>
          <button
            onClick={clearCategoryFilter}
            className="ml-auto p-1 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input 
            id="vault-search"
            placeholder="Search vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-1">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filteredItems.length === 0 ? (
        <EmptyState 
          icon={Shield} 
          title={searchQuery ? "No results found" : categoryFilter ? "No items in this category" : "Your vault is empty"} 
          description={searchQuery ? "Try adjusting your search terms." : categoryFilter ? "Add items to this category or clear the filter." : "Add your first password to start securing your digital life."}
          action={!searchQuery && !categoryFilter ? { label: "Add Item", onClick: () => setIsCreateModalOpen(true) } : categoryFilter ? { label: "Clear Filter", onClick: clearCategoryFilter } : undefined}
        />
      ) : (
        <div className={viewMode === 'list' 
          ? "flex flex-col gap-2" 
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        }>
          {filteredItems.map(item => (
            <VaultItemCard 
              key={item.uuid} 
              item={item} 
              viewMode={viewMode} 
              onClick={setSelectedItem}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      {/* View/Edit Modal */}
      <VaultItemModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem}
        template={customTemplates.find(template => template.uuid === selectedItem?.templateUuid) || null}
        onUpdate={updateItem}
        onDelete={(uuid) => { deleteItem(uuid); setSelectedItem(null); }}
      />

      {/* NEW: Create Item Modal */}
      <CreateItemModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        prefilledPassword={prefilledPassword}
      />
    </div>
  );
};

