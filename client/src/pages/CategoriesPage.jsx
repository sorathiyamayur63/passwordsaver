import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  Folder, Plus, Edit3, Trash2, ChevronRight, Package,
  User, Share2, GraduationCap, Briefcase, Landmark, ShoppingBag,
  Film, Terminal, Plane, HeartPulse, Building2, Hash,
  ArrowLeft, Search, LayoutGrid, List as ListIcon, Shield, Star
} from 'lucide-react';
import { Card, Button, Input, Badge, Spinner, Modal } from '../components/ui';
import { useVault } from '../hooks/useVault';
import { vaultApi } from '../services/vaultApi';
import { VaultItemCard } from '../components/vault/VaultItemCard';
import { VaultItemModal } from '../components/vault/VaultItemModal';
import toast from 'react-hot-toast';

// ─── Icon Map ──────────────────────────────────────────────────────────────
const ICON_MAP = {
  'user': User,
  'share-2': Share2,
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'landmark': Landmark,
  'shopping-bag': ShoppingBag,
  'film': Film,
  'terminal': Terminal,
  'plane': Plane,
  'heart-pulse': HeartPulse,
  'building-2': Building2,
  'folder': Folder,
};

const ICON_OPTIONS = Object.entries(ICON_MAP).map(([key, Icon]) => ({ key, Icon }));

const COLOR_OPTIONS = [
  '#6366f1', '#ec4899', '#f59e0b', '#3b82f6', '#10b981',
  '#f97316', '#8b5cf6', '#06b6d4', '#14b8a6', '#ef4444',
  '#64748b', '#6b7280', '#e11d48', '#0ea5e9', '#84cc16'
];

const CategoryIcon = memo(({ iconName, color, size = 'md' }) => {
  const IconComp = ICON_MAP[iconName] || Folder;
  const sizeClass = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return <IconComp className={sizeClass} style={{ color }} />;
});
CategoryIcon.displayName = 'CategoryIcon';

// ─── Inline Category Items View ────────────────────────────────────────────
const CategoryItemsView = memo(({ category, items, onBack, onUpdateItem, onDeleteItem, onToggleFavorite }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => {
      const d = item.decryptedData;
      if (!d) return false;
      return Object.values(d).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
    });
  }, [items, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Back to categories"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: (category.color || '#6b7280') + '22' }}
          >
            <CategoryIcon iconName={category.icon} color={category.color} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{category.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      {items.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={`Search in ${category.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
          />
        </div>
      )}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Shield className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">
            {searchQuery ? 'No results found' : 'No items in this category'}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            {searchQuery ? 'Try a different search term.' : 'Items assigned to this category will appear here.'}
          </p>
        </Card>
      ) : (
        <div className={viewMode === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
          {filteredItems.map(item => (
            <VaultItemCard
              key={item.uuid}
              item={item}
              viewMode={viewMode}
              onClick={setSelectedItem}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      <VaultItemModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onUpdate={onUpdateItem}
        onDelete={(uuid) => { onDeleteItem(uuid); setSelectedItem(null); }}
      />
    </div>
  );
});
CategoryItemsView.displayName = 'CategoryItemsView';

// ─── Main Categories Page ──────────────────────────────────────────────────
export const CategoriesPage = () => {
  const { items, categories, isLoading, isFetching, fetchItems, fetchCategories, updateItem, deleteItem, toggleFavorite } = useVault();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [orderedCategories, setOrderedCategories] = useState([]);
  // NEW: selected category for inline item view (null = show category grid)
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Drag-and-drop refs
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('folder');
  const [formColor, setFormColor] = useState('#6b7280');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  useEffect(() => {
    if (categories) setOrderedCategories(categories);
  }, [categories]);

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...orderedCategories];
    const dragged = updated.splice(dragItem.current, 1)[0];
    updated.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setOrderedCategories(updated);
    try {
      const orderings = updated.map((cat, i) => ({ uuid: cat.uuid, order: i }));
      await vaultApi.reorderCategories(orderings);
    } catch {
      toast.error('Failed to save order');
    }
  };

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    items.forEach(item => {
      const catId = item.categoryUuid || '__uncategorized__';
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Items for selected category
  const selectedCategoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === '__uncategorized__') return items.filter(i => !i.categoryUuid);
    if (selectedCategory._showAll) return items;
    return items.filter(i => i.categoryUuid === selectedCategory.uuid);
  }, [selectedCategory, items]);

  const openCreateModal = useCallback(() => {
    setEditingCategory(null);
    setFormName('');
    setFormIcon('folder');
    setFormColor('#6b7280');
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((cat, e) => {
    e?.stopPropagation();
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setModalOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formName.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editingCategory) {
        await vaultApi.updateCategory(editingCategory.uuid, { name: formName.trim(), icon: formIcon, color: formColor });
        toast.success('Category updated');
      } else {
        await vaultApi.createCategory({ name: formName.trim(), icon: formIcon, color: formColor });
        toast.success('Category created');
      }
      await fetchCategories();
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    try {
      await vaultApi.deleteCategory(cat.uuid);
      toast.success('Category deleted');
      setDeleteConfirm(null);
      // If we were viewing this category's items, go back
      if (selectedCategory?.uuid === cat.uuid) setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  // ── Show Inline Item View ──
  if (selectedCategory) {
    const cat = selectedCategory === '__uncategorized__'
      ? { name: 'Uncategorized', icon: 'folder', color: '#6b7280', uuid: '__uncategorized__' }
      : selectedCategory;
    return (
      <CategoryItemsView
        category={cat}
        items={selectedCategoryItems}
        onBack={() => setSelectedCategory(null)}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            Categories
            {isFetching && !isLoading && <Spinner size="sm" className="opacity-50" />}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Organize your vault items into categories for easy access.
          </p>
        </div>
        <Button leftIcon={Plus} onClick={openCreateModal}>New Category</Button>
      </div>

      {/* All Items Card */}
      <Card
        padding="md"
        hover
        clickable
        onClick={() => setSelectedCategory({ name: 'All Items', icon: 'package', color: '#6366f1', uuid: '__all__', _showAll: true })}
        className="flex items-center justify-between border-[var(--border)] group"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
            <Package className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">All Items</h3>
            <p className="text-sm text-[var(--text-muted)]">View all saved passwords</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" size="sm">{items.length} items</Badge>
          <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
        </div>
      </Card>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderedCategories.map((cat, index) => {
          const count = categoryCounts[cat.uuid] || 0;
          return (
            <div
              key={cat.uuid}
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="cursor-grab active:cursor-grabbing"
            >
              <Card
                padding="md"
                hover
                clickable
                onClick={() => setSelectedCategory(cat)}
                className="flex flex-col relative group border-[var(--border)] h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: cat.color + '18' }}
                  >
                    <CategoryIcon iconName={cat.icon} color={cat.color} />
                  </div>

                  {!cat.isDefault && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditModal(cat, e)}
                        className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Edit category"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(cat); }}
                        className="p-1.5 rounded-md hover:bg-[var(--danger-subtle)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{cat.name}</h3>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">{count} {count === 1 ? 'item' : 'items'}</span>
                  {cat.isDefault && <Badge variant="default" size="sm">Default</Badge>}
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Uncategorized */}
      {(categoryCounts['__uncategorized__'] || 0) > 0 && (
        <Card
          padding="md"
          hover
          clickable
          onClick={() => setSelectedCategory('__uncategorized__')}
          className="flex items-center justify-between border-dashed border-[var(--border)] group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
              <Hash className="h-6 w-6 text-[var(--text-muted)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Uncategorized</h3>
              <p className="text-sm text-[var(--text-muted)]">Items without a category</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="warning" size="sm">{categoryCounts['__uncategorized__']} items</Badge>
            <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </div>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        size="sm"
      >
        <div className="space-y-5">
          <Input
            label="Category Name"
            placeholder="e.g. Streaming Services"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            maxLength={50}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormIcon(key)}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                    formIcon === key
                      ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  <Icon className="h-5 w-5" style={{ color: formIcon === key ? 'var(--accent)' : 'var(--text-secondary)' }} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    formColor === color ? 'border-[var(--text-primary)] scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!formName.trim()}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to delete{' '}
            <strong className="text-[var(--text-primary)]">{deleteConfirm?.name}</strong>?
            Items in this category will become uncategorized.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
