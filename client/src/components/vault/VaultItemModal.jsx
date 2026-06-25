import React, { useState } from 'react';
import { Modal, Button, CopyButton, Badge } from '../ui';
import { ItemTypeIcon } from './ItemTypeIcon';
import { FaviconOrIcon } from './FaviconOrIcon';
import { LoginForm, CreditCardForm, SecureNoteForm, CustomTemplateForm } from './forms/VaultForms';
import { Eye, EyeOff, CheckSquare, Square, Folder } from 'lucide-react'; // Added Checkbox Icons!
import { useVault } from '../../hooks/useVault';

const sensitiveKeys = ['password', 'cvv', 'cardNumber', 'apiKey', 'licenseKey', 'aadhaarNumber'];

const MaskedField = ({ value }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <div className="font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded text-sm text-[var(--text-primary)] tracking-wider">
        {show ? value : '••••••••••••'}
      </div>
      <button onClick={() => setShow(!show)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

export const VaultItemModal = ({ isOpen, onClose, item, onUpdate, onDelete, template }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { categories } = useVault();

  if (!item) return null;

  const category = categories.find(c => c.uuid === item.categoryUuid);

  const data = item.decryptedData || {};
  const fallbackCustomTemplate = item.itemType === 'custom' && !template
    ? {
        uuid: item.templateUuid || item.uuid,
        name: 'Custom Template',
        fields: Object.entries(data)
          .filter(([key]) => key !== 'title' && key !== 'templateUuid')
          .map(([key, value], index) => ({
            uuid: `${item.uuid}-${key}`,
            label: key,
            fieldType: typeof value === 'boolean' ? 'checkbox' : 'text',
            isRequired: false,
            isSensitive: false,
            options: [],
            order: index + 1
          }))
      }
    : null;

  const handleUpdate = async (formData) => {
    const updatedCategoryUuid = formData.categoryUuid !== undefined ? formData.categoryUuid : item.categoryUuid;
    const success = await onUpdate(item.uuid, formData, updatedCategoryUuid);
    if (success) setIsEditing(false);
  };

  const getFormComponent = () => {
    const formDataWithCat = { ...data, categoryUuid: item.categoryUuid };
    
    if (item.itemType === 'custom') {
      return <CustomTemplateForm template={template || fallbackCustomTemplate} defaultValues={formDataWithCat} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} categories={categories} />;
    }

    switch (item.itemType) {
      case 'login': return <LoginForm defaultValues={formDataWithCat} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} categories={categories} />;
      case 'credit_card': return <CreditCardForm defaultValues={formDataWithCat} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} categories={categories} />;
      case 'secure_note': return <SecureNoteForm defaultValues={formDataWithCat} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} categories={categories} />;
      // Fallback
      default: return <LoginForm defaultValues={formDataWithCat} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} categories={categories} />;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => { setIsEditing(false); onClose(); }}
      size="lg"
      title={
        <div className="flex items-center gap-3">
          <FaviconOrIcon url={data?.website || data?.url} type={item.itemType} className="h-6 w-6 object-contain" fallbackClassName="h-5 w-5 text-[var(--accent)]" />
          <span>{data.title || 'View Item'}</span>
          <Badge className="ml-2">{(item.itemType || 'unknown').replace('_', ' ')}</Badge>
        </div>
      }
    >
      {!isEditing ? (
        <div className="space-y-6">
          {category && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Category</span>
              <Badge 
                className="flex items-center gap-1.5 py-1 px-2.5" 
                style={{ backgroundColor: category.color + '15', color: category.color, borderColor: category.color + '40', borderWidth: '1px' }}
              >
                <Folder className="h-3.5 w-3.5" />
                {category.name}
              </Badge>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(data).filter(([k]) => k !== 'title' && k !== 'templateUuid' && k !== 'categoryUuid' && k !== '_error' && k !== 'personUuid' && k !== 'groupUuid').map(([key, value]) => {
              
              // FIX 1: Safely check for empty strings or nulls, but DO NOT skip 'false' booleans!
              if (value === '' || value === null || value === undefined) return null;
              
              const isSensitive = sensitiveKeys.includes(key);
              const isBoolean = typeof value === 'boolean';
              
              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] gap-2">
                  <span className="text-sm font-medium text-[var(--text-secondary)] capitalize w-32 shrink-0">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  
                  <div className="flex items-center justify-between flex-1 gap-4 overflow-hidden">
                    
                    {/* FIX 2: Explicitly render booleans as visual checkboxes */}
                    {isBoolean ? (
                      <div className="flex items-center gap-2 text-[var(--text-primary)]">
                        {value ? <CheckSquare className="h-5 w-5 text-[var(--accent)]" /> : <Square className="h-5 w-5 text-[var(--text-muted)]" />}
                        <span className="text-sm font-medium">{value ? 'Yes' : 'No'}</span>
                      </div>
                    ) : isSensitive ? (
                      <MaskedField value={value} />
                    ) : (
                      <span className="text-sm text-[var(--text-primary)] truncate" title={typeof value === 'object' ? JSON.stringify(value) : String(value)}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    )}

                    {/* Hide the copy button for checkboxes, since copying true/false doesn't make much sense */}
                    {!isBoolean && <CopyButton value={value} />}
                    
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-6 border-t border-[var(--border)]">
            <Button variant="danger" onClick={() => onDelete(item.uuid)}>Delete Item</Button>
            {data._error ? (
              <span className="text-sm text-[var(--text-muted)] italic self-center">Cannot edit — decryption failed</span>
            ) : (
              <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Item</Button>
            )}
          </div>
        </div>
      ) : (
        getFormComponent()
      )}
    </Modal>
  );
};