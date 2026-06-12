import React, { useState, useEffect } from 'react';
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Modal, Button, Input, Toggle, Card } from '../ui';
import { cloneTemplateFields, createBlankTemplateField, normalizeTemplateFields } from '../../utils/templateFields';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'password', label: 'Password (Masked)' },
  { value: 'textarea', label: 'Long Text / Notes' },
  { value: 'email', label: 'Email Address' },
  { value: 'url', label: 'Website URL' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'dropdown', label: 'Dropdown' }
];

export const TemplateBuilderModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setFields(initialData.isSystem ? cloneTemplateFields(initialData.fields) : normalizeTemplateFields(initialData.fields));
      } else {
        setName('');
        setDescription('');
        setFields([createBlankTemplateField(1)]);
      }
    }
  }, [isOpen, initialData]);

  const addField = () => {
    setFields([...fields, createBlankTemplateField(fields.length + 1)]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.uuid === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    if (fields.length <= 1) return;
    setFields(fields.filter(f => f.uuid !== id));
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setFields(newFields);
  };

  const handleSubmit = async () => {
    if (!name.trim() || fields.length === 0) return;
    setLoading(true);
    await onSave({
      name,
      description,
      fields: normalizeTemplateFields(fields).map((field, index) => ({
        ...field,
        order: index + 1
      }))
    });
    setLoading(false);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData?.isSystem ? 'Use as Blueprint' : initialData ? 'Edit Template' : 'Create Custom Template'}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || !name.trim() || fields.length === 0}>
            Save Template
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Builder */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">1. Template Information</h3>
            <Input label="Template Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wi-Fi Router" />
            <Input label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">2. Form Fields</h3>
              <Button size="sm" variant="outline" leftIcon={Plus} onClick={addField}>Add Field</Button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <Card key={field.uuid} padding="sm" className="bg-[var(--bg-secondary)] border-[var(--border)] relative overflow-visible">
                  <div className="flex gap-4">
                    {/* Ordering Controls */}
                    <div className="flex flex-col gap-1 shrink-0 mt-6">
                      <button onClick={() => moveField(idx, 'up')} disabled={idx === 0} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => moveField(idx, 'down')} disabled={idx === fields.length - 1} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Field Label" value={field.label} onChange={(e) => updateField(field.uuid, 'label', e.target.value)} />
                        <div>
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Type</label>
                          <select 
                            className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] focus:ring-[var(--border-focus)] focus:outline-none"
                            value={field.fieldType}
                            onChange={(e) => updateField(field.uuid, 'fieldType', e.target.value)}
                          >
                            {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                          </select>
                        </div>
                      </div>

                      {field.fieldType === 'dropdown' && (
                        <Input 
                          label="Options (comma separated)" 
                          value={field.options?.join(', ') || ''} 
                          onChange={(e) => updateField(field.uuid, 'options', e.target.value.split(',').map(s => s.trim()))} 
                          placeholder="Option 1, Option 2"
                        />
                      )}

                      <div className="flex gap-4 pt-2">
                        <Toggle checked={field.isRequired} onChange={(c) => updateField(field.uuid, 'isRequired', c)} label="Required" size="sm" />
                        <Toggle checked={field.isSensitive} onChange={(c) => updateField(field.uuid, 'isSensitive', c)} label="Mask Output" size="sm" />
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <button onClick={() => removeField(field.uuid)} className="absolute top-2 right-2 p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)] rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className="hidden lg:block border-l border-[var(--border)] pl-8">
          <div className="sticky top-0 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center justify-between">
              Live Form Preview
              <span className="text-xs font-normal text-[var(--text-muted)]">Read-only visual check</span>
            </h3>
            
            <Card padding="md" className="bg-[var(--bg-primary)] shadow-sm">
              <h2 className="text-lg font-bold mb-4">{name || 'Untitled Template'}</h2>
              <div className="space-y-4 opacity-80 pointer-events-none select-none">
                {fields.map((f, i) => (
                  <div key={i}>
                    {f.fieldType === 'textarea' ? (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-primary)]">{f.label || 'Field'} {f.isRequired && '*'}</label>
                        <div className="h-20 w-full border border-[var(--border)] rounded-md bg-[var(--bg-secondary)]" />
                      </div>
                    ) : f.fieldType === 'checkbox' ? (
                      <div className="flex items-center gap-2 mt-6">
                        <div className="h-4 w-4 rounded border border-[var(--border)] bg-[var(--bg-secondary)]" />
                        <label className="text-sm font-medium text-[var(--text-primary)]">{f.label || 'Field'} {f.isRequired && '*'}</label>
                      </div>
                    ) : f.fieldType === 'dropdown' ? (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--text-primary)]">{f.label || 'Field'} {f.isRequired && '*'}</label>
                        <div className="h-10 w-full border border-[var(--border)] rounded-md bg-[var(--bg-secondary)] flex items-center px-3 justify-between">
                          <span className="text-[var(--text-muted)] text-sm">{f.options?.[0] || 'Select...'}</span>
                          <ArrowDown className="h-3 w-3 text-[var(--text-muted)]" />
                        </div>
                      </div>
                    ) : (
                      <Input label={`${f.label || 'Field'}${f.isRequired ? ' *' : ''}`} type={f.fieldType === 'password' ? 'password' : 'text'} disabled />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
};