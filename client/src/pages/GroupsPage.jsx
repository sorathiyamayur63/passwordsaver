import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Edit3, Trash2, ChevronRight, GripVertical,
  Home, UserCheck, Landmark, Megaphone, TrendingUp, Terminal,
  Briefcase, Heart, Shield, Folder
} from 'lucide-react';
import { Card, Button, Input, Badge, Spinner, Modal } from '../components/ui';
import { useGroupsQuery, useGroupMutations } from '../hooks/useGroups';
import toast from 'react-hot-toast';

const ICON_MAP = {
  'users': Users,
  'home': Home,
  'user-check': UserCheck,
  'landmark': Landmark,
  'megaphone': Megaphone,
  'trending-up': TrendingUp,
  'terminal': Terminal,
  'briefcase': Briefcase,
  'heart': Heart,
  'shield': Shield,
  'folder': Folder,
};

const ICON_OPTIONS = Object.entries(ICON_MAP).map(([key, Icon]) => ({ key, Icon }));

const COLOR_OPTIONS = [
  '#6366f1', '#ec4899', '#f59e0b', '#3b82f6', '#10b981',
  '#f97316', '#8b5cf6', '#06b6d4', '#14b8a6', '#ef4444',
  '#64748b', '#6b7280', '#e11d48', '#0ea5e9', '#84cc16'
];

const GroupIcon = ({ iconName, color, size = 'md' }) => {
  const IconComp = ICON_MAP[iconName] || Users;
  const px = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return <IconComp className={px} style={{ color }} />;
};

export const GroupsPage = () => {
  const navigate = useNavigate();
  const { data: groups, isLoading: loading, isFetching } = useGroupsQuery();
  const { createGroup, updateGroup, deleteGroup, reorderGroups } = useGroupMutations();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [orderedGroups, setOrderedGroups] = useState([]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('users');
  const [formColor, setFormColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (groups) setOrderedGroups(groups);
  }, [groups]);

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...orderedGroups];
    const dragged = updated.splice(dragItem.current, 1)[0];
    updated.splice(dragOverItem.current, 0, dragged);
    setOrderedGroups(updated);
    dragItem.current = null;
    dragOverItem.current = null;

    const orderings = updated.map((g, i) => ({ uuid: g.uuid, order: i }));
    await reorderGroups(orderings);
  };

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormName('');
    setFormIcon('users');
    setFormColor('#6366f1');
    setModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setFormName(group.name);
    setFormIcon(group.icon);
    setFormColor(group.color);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Group name is required');
      return;
    }
    setSaving(true);
    const data = { name: formName.trim(), icon: formIcon, color: formColor };
    let success = false;
    try {
      if (editingGroup) {
        success = await updateGroup(editingGroup.uuid, data);
      } else {
        success = await createGroup(data);
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
    await deleteGroup(deleteConfirm.uuid);
    setDeleteConfirm(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            Groups
            {isFetching && !loading && <Spinner size="sm" className="opacity-50" />}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage shared vaults and team access.</p>
        </div>
        <Button onClick={openCreateModal} className="shrink-0"><Plus className="h-4 w-4 mr-2" /> Create Group</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : orderedGroups.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Users className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No groups yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Create your first group to organize people and their vault items.</p>
          <Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" /> Create Group</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedGroups.map((group, index) => (
            <Card
              key={group.uuid}
              padding="md"
              className="cursor-pointer hover:border-[var(--accent)] transition-all group/card"
              draggable
              onDragStart={() => { dragItem.current = index; }}
              onDragEnter={() => { dragOverItem.current = index; }}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => navigate(`/groups/${group.uuid}`)}
                >
                  <div
                    className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${group.color}20` }}
                  >
                    <GroupIcon iconName={group.icon} color={group.color} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">{group.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {group.memberCount || 0} {group.memberCount === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(group); }}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(group); }}
                    className="p-1.5 rounded-md hover:bg-[var(--danger-subtle)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between pt-3 border-t border-[var(--border)]"
                onClick={() => navigate(`/groups/${group.uuid}`)}
              >
                <span className="text-xs text-[var(--text-muted)]">
                  {group.isDefault && <Badge variant="default" size="sm">Default</Badge>}
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroup ? 'Edit Group' : 'New Group'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingGroup ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Group Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Family"
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormIcon(key)}
                  className={`p-2 rounded-lg border transition-all ${formIcon === key ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)] hover:border-[var(--text-muted)]'}`}
                >
                  <Icon className="h-5 w-5" style={{ color: formIcon === key ? formColor : 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormColor(color)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${formColor === color ? 'border-[var(--text-primary)] scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Group"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Group</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-primary)]">
          Delete <strong>{deleteConfirm?.name}</strong>? All people in this group and their vault items will be moved to trash.
        </p>
      </Modal>
    </div>
  );
};
