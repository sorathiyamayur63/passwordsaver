import React, { useState, useEffect } from 'react';
import { Layout, Plus, Settings, Lock, Copy } from 'lucide-react';
import { Card, Button, Badge, Spinner } from '../components/ui';
import { TemplateBuilderModal } from '../components/templates/TemplateBuilderModal';
import { templateApi } from '../services/templateApi';
import { SYSTEM_TEMPLATES } from '../utils/systemTemplates';
import { normalizeTemplate } from '../utils/templateFields';
import toast from 'react-hot-toast';

export const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [blueprintTemplate, setBlueprintTemplate] = useState(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateApi.getTemplates();
      const loadedTemplates = Array.isArray(res.data?.templates) ? res.data.templates : [];
      setTemplates(loadedTemplates.filter(template => !template.isSystem).map(normalizeTemplate));
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await templateApi.updateTemplate(editingTemplate.uuid, templateData);
        toast.success('Template updated');
      } else {
        await templateApi.createTemplate(templateData);
        toast.success('Template created');
      }
      setBlueprintTemplate(null);
      setEditingTemplate(null);
      loadTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to save template');
    }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Are you sure you want to delete this template? Vault items using it will retain their structure, but you cannot create new items with it.')) return;
    
    try {
      await templateApi.deleteTemplate(uuid);
      toast.success('Template deleted');
      setTemplates(templates.filter(t => t.uuid !== uuid));
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const myTemplates = templates.filter(t => !t.isSystem);
  const blueprintTemplates = SYSTEM_TEMPLATES;

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Item Templates</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage structures for your vault items</p>
        </div>
        <Button leftIcon={Plus} onClick={() => { setEditingTemplate(null); setBuilderOpen(true); }}>
          Create Custom Template
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[var(--accent)]" />
          My Custom Templates
        </h2>
        
        {myTemplates.length === 0 ? (
          <Card padding="lg" className="text-center bg-[var(--bg-secondary)] border-dashed border-2">
            <Layout className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] text-sm">You haven't created any custom templates yet.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setEditingTemplate(null); setBlueprintTemplate(null); setBuilderOpen(true); }}>Create One</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTemplates.map(t => (
              <Card key={t.uuid} padding="md" className="flex flex-col h-full border-[var(--border)]">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">{t.name}</h3>
                  <Badge variant="info" size="sm">{t.fields.length} fields</Badge>
                </div>
                {t.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4">{t.description}</p>}
                
                <div className="mt-auto pt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => { setEditingTemplate(t); setBlueprintTemplate(null); setBuilderOpen(true); }}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(t.uuid)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[var(--text-muted)]" />
          System Templates <Badge size="sm" className="ml-2 font-normal">Read Only</Badge>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprintTemplates.map(t => (
            <Card key={t.uuid} padding="md" className="flex flex-col h-full bg-[var(--bg-secondary)] border-[var(--border)]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">{t.name}</h3>
                <Badge variant="default" size="sm">{t.fields.length} fields</Badge>
              </div>
              {t.desc && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4">{t.desc}</p>}
              <div className="text-xs text-[var(--text-muted)] mt-auto pt-4">
                Fields: {t.fields.slice(0, 3).map(f => f.label).join(', ')}{t.fields.length > 3 ? '...' : ''}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={Copy}
                  className="flex-1"
                  onClick={() => {
                    setEditingTemplate(null);
                    setBlueprintTemplate(normalizeTemplate(t));
                    setBuilderOpen(true);
                  }}
                >
                  Use as Blueprint
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <TemplateBuilderModal 
        isOpen={builderOpen} 
        onClose={() => setBuilderOpen(false)} 
        initialData={editingTemplate || blueprintTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};