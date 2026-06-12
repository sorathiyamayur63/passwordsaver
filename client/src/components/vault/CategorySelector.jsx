import React, { useState, useEffect } from 'react';
import { Folder, Plus, ChevronDown } from 'lucide-react';
import { vaultApi } from '../../services/vaultApi';
import { Input, Button } from '../ui';
import toast from 'react-hot-toast';

export const CategorySelector = ({ value, onChange, categories: propCategories }) => {
  const [categories, setCategories] = useState(propCategories || []);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      loadCategories();
    }
  }, [propCategories]);

  const loadCategories = async () => {
    try {
      const res = await vaultApi.getCategories();
      setCategories(res.data.categories);
    } catch (e) {}
  };

  const selectedCat = categories.find(c => c.uuid === value);

  const handleSelect = (uuid) => {
    onChange(uuid);
    setIsOpen(false);
    setIsCreating(false);
  };

  const handleCreateNew = async () => {
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      const res = await vaultApi.createCategory({
        name: newCatName.trim(),
        icon: 'folder',
        color: '#6b7280'
      });
      const newCat = res.data.category;
      setCategories(prev => [...prev, newCat]);
      onChange(newCat.uuid);
      setIsCreating(false);
      setNewCatName('');
      setIsOpen(false);
      toast.success('Category created');
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--text-primary)]">Category</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors focus:ring-2 focus:ring-[var(--border-focus)] outline-none"
        >
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" style={{ color: selectedCat?.color || 'var(--text-muted)' }} />
            <span>{selectedCat?.name || 'Select a category'}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
            <div className="max-h-48 overflow-y-auto app-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.uuid}
                  type="button"
                  onClick={() => handleSelect(cat.uuid)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-tertiary)] ${
                    value === cat.uuid ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <Folder className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-[var(--border)]">
              {!isCreating ? (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create new category
                </button>
              ) : (
                <div className="p-2 flex items-center gap-2">
                  <Input
                    placeholder="Category name"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateNew(); } }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleCreateNew} loading={saving} disabled={!newCatName.trim()}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
