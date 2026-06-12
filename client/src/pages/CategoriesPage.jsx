import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder, Plus, Edit3, Trash2, ChevronRight, Package,
  User, Share2, GraduationCap, Briefcase, Landmark, ShoppingBag,
  Film, Terminal, Plane, HeartPulse, Building2, Hash
} from 'lucide-react';
import { Card, Button, Input, Badge, Spinner, Modal } from '../components/ui';
import { useVault } from '../hooks/useVault';
import { vaultApi } from '../services/vaultApi';
import toast from 'react-hot-toast';

// Map icon string names to lucide-react components
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

const CategoryIcon = ({ iconName, color, size = 'md' }) => {
  const IconComp = ICON_MAP[iconName] || Folder;
  const sizeClass = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return <IconComp className={sizeClass} style={{ color }} />;
};

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const { items, categories, fetchItems, fetchCategories } = useVault();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [orderedCategories, setOrderedCategories] = useState([]);

  // Drag and drop refs
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('folder');
  const [formColor, setFormColor] = useState('#6b7280');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchItems()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    setOrderedCategories(categories);
  }, [categories]);

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    let _orderedCategories = [...orderedCategories];
    const draggedItemContent = _orderedCategories.splice(dragItem.current, 1)[0];
    _orderedCategories.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;

    setOrderedCategories(_orderedCategories);

    try {
      const orderings = _orderedCategories.map((cat, index) => ({ uuid: cat.uuid, order: index }));
      await vaultApi.reorderCategories(orderings);
    } catch (err) {
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

  const totalItems = items.length;

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormIcon('folder');
    setFormColor('#6b7280');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon);
    setFormColor(cat.color);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await vaultApi.updateCategory(editingCategory.uuid, {
          name: formName.trim(),
          icon: formIcon,
          color: formColor
        });
        toast.success('Category updated');
      } else {
        await vaultApi.createCategory({
          name: formName.trim(),
          icon: formIcon,
          color: formColor
        });
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
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
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
        onClick={() => navigate('/vault')}
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
          <Badge variant="default" size="sm">{totalItems} items</Badge>
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
                onClick={() => navigate(`/vault?category=${cat.uuid}`)}
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
                      onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
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
          onClick={() => navigate('/vault?category=uncategorized')}
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

      {/* Create/Edit Modal */}
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

          {/* Icon Picker */}
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

          {/* Color Picker */}
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
            Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deleteConfirm?.name}</strong>?
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
