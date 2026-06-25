import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Plus, Edit3, Trash2, ChevronRight, Search, Star, GripVertical,
  User, ArrowLeft, SortAsc, Filter
} from 'lucide-react';
import { Card, Button, Input, Badge, Spinner, Modal, EmptyState } from '../components/ui';
import { useGroupDetailQuery, usePeopleMutations } from '../hooks/useGroups';
import toast from 'react-hot-toast';

export const GroupDetailPage = () => {
  const { groupUuid } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading: loading, isFetching } = useGroupDetailQuery(groupUuid);
  const { createPerson, updatePerson, deletePerson, reorderPeople, toggleFavPerson } = usePeopleMutations(groupUuid);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [orderedPeople, setOrderedPeople] = useState([]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [saving, setSaving] = useState(false);

  const currentGroup = data?.group;
  const people = data?.people || [];

  useEffect(() => {
    if (people) setOrderedPeople(people);
  }, [people]);

  const filteredPeople = useMemo(() => {
    let filtered = [...orderedPeople];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        (p.nickname && p.nickname.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'nickname') {
      filtered.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || ''));
    } else if (sortBy === 'updated') {
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
    // 'order' keeps the natural order from orderedPeople

    return filtered;
  }, [orderedPeople, searchQuery, sortBy]);

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...orderedPeople];
    const dragged = updated.splice(dragItem.current, 1)[0];
    updated.splice(dragOverItem.current, 0, dragged);
    setOrderedPeople(updated);
    dragItem.current = null;
    dragOverItem.current = null;

    const orderings = updated.map((p, i) => ({ uuid: p.uuid, order: i }));
    await reorderPeople(orderings);
  };

  const openCreateModal = () => {
    setEditingPerson(null);
    setFormFullName('');
    setFormNickname('');
    setModalOpen(true);
  };

  const openEditModal = (person) => {
    setEditingPerson(person);
    setFormFullName(person.fullName);
    setFormNickname(person.nickname || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formFullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    setSaving(true);
    const data = { fullName: formFullName.trim(), nickname: formNickname.trim() };
    let success = false;
    try {
      if (editingPerson) {
        success = await updatePerson(editingPerson.uuid, data);
      } else {
        success = await createPerson(data);
      }
    } finally {
      setSaving(false);
    }
    if (success) {
      setModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deletePerson(deleteConfirm.uuid);
    setDeleteConfirm(null);
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/groups" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Groups</Link>
        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="font-medium text-[var(--text-primary)]">{currentGroup?.name || 'Group'}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              {currentGroup?.name || 'Group'}
              {isFetching && !loading && <Spinner size="sm" className="opacity-50" />}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">{filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'}</p>
          </div>
        </div>
        <Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" /> Add Person</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Search & Sort Bar */}
      {orderedPeople.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="order">Custom Order</option>
            <option value="name">Name</option>
            <option value="nickname">Nickname</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      )}

      {/* People Grid */}
      {filteredPeople.length === 0 && !searchQuery ? (
        <Card padding="lg" className="text-center">
          <User className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No people yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Add people to this group to manage their vault items.</p>
          <Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" /> Add Person</Button>
        </Card>
      ) : filteredPeople.length === 0 && searchQuery ? (
        <Card padding="lg" className="text-center">
          <Search className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">No results for "{searchQuery}"</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person, index) => (
            <Card
              key={person.uuid}
              padding="md"
              className="cursor-pointer hover:border-[var(--accent)] transition-all group/card"
              draggable={sortBy === 'order'}
              onDragStart={() => { dragItem.current = index; }}
              onDragEnter={() => { dragOverItem.current = index; }}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: currentGroup?.color || '#6366f1' }}
                >
                  {getInitials(person.fullName)}
                </div>

                <div className="flex-1 min-w-0" onClick={() => navigate(`/groups/${groupUuid}/people/${person.uuid}`)}>
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">{person.fullName}</h3>
                  {person.nickname && (
                    <p className="text-xs text-[var(--text-muted)] truncate">"{person.nickname}"</p>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {person.vaultItemCount || 0} vault items
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavPerson(person); }}
                    className={`p-1.5 rounded-md transition-colors ${person.isFavorite ? 'text-[var(--warning)]' : 'text-[var(--text-muted)] hover:text-[var(--warning)]'}`}
                  >
                    <Star className="h-4 w-4" fill={person.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(person); }}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(person); }}
                    className="p-1.5 rounded-md hover:bg-[var(--danger-subtle)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {sortBy === 'order' && (
                    <div className="cursor-grab text-[var(--text-muted)]">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              <div
                className="flex items-center justify-end pt-3 mt-3 border-t border-[var(--border)]"
                onClick={() => navigate(`/groups/${groupUuid}/people/${person.uuid}`)}
              >
                <span className="text-xs text-[var(--accent)] flex items-center gap-1">
                  View Vault <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Person Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPerson ? 'Edit Person' : 'Add Person'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingPerson ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            placeholder="e.g. John Doe"
            autoFocus
          />
          <Input
            label="Nickname (Optional)"
            value={formNickname}
            onChange={(e) => setFormNickname(e.target.value)}
            placeholder="e.g. Dad"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remove Person"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-primary)]">
            Are you sure you want to remove <strong>{deleteConfirm?.fullName}</strong> from this group?
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            This will permanently delete their profile and all associated vault items. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove Person</Button>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  );
};
