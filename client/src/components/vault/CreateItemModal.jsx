import React, { useState, useEffect } from 'react';
import { ArrowLeft, Box } from 'lucide-react';
import { Modal, Button, Card } from '../ui';
import { ItemTypeIcon } from './ItemTypeIcon';
import { LoginForm, CreditCardForm, SecureNoteForm, CustomTemplateForm } from './forms/VaultForms';
import { useVault } from '../../hooks/useVault';
import { templateApi } from '../../services/templateApi';
import { normalizeTemplate } from '../../utils/templateFields';
import { detectCategory } from '../../utils/categoryDetector';

const ITEM_TYPES = [
  { id: 'login', name: 'Login Credential', desc: 'Website or app passwords' },
  { id: 'credit_card', name: 'Credit Card', desc: 'Credit card details & CVV' },
  { id: 'secure_note', name: 'Secure Note', desc: 'Encrypted free-form text' },
];

export const CreateItemModal = ({ isOpen, onClose, prefilledPassword = '' }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const { createItem, categories } = useVault();

  const [customTemplates, setCustomTemplates] = useState([]);
  const [systemTemplates, setSystemTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomTemplates();
    }
  }, [isOpen]);

  const fetchCustomTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const res = await templateApi.getTemplates();
      
      let templatesArray = [];
      if (Array.isArray(res.data)) templatesArray = res.data;
      else if (Array.isArray(res.data?.data)) templatesArray = res.data.data;
      else if (Array.isArray(res.data?.data?.templates)) templatesArray = res.data.data.templates;
      else if (Array.isArray(res.data?.templates)) templatesArray = res.data.templates;

      const dedicatedForms = ['Login Credential', 'Credit Card', 'Secure Notes'];

      setSystemTemplates(
        templatesArray
          .filter(template => template.isSystem && !dedicatedForms.includes(template.name))
          .map(normalizeTemplate)
      );

      setCustomTemplates(
        templatesArray
          .filter(template => !template.isSystem)
          .map(normalizeTemplate)
      );
    } catch (error) {
      console.error("Failed to load templates", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    onClose();
  };

  const handleCreate = async (formData) => {
    setLoading(true);
    let finalCategoryUuid = formData.categoryUuid;

    // Auto-detect category if user didn't explicitly select one
    if (!finalCategoryUuid || finalCategoryUuid === '') {
      const detectedUuid = detectCategory(formData, categories);
      if (detectedUuid) {
        finalCategoryUuid = detectedUuid;
      }
    }

    const payload = selectedType?.id === 'custom' && selectedType.template?.uuid
      ? { ...formData, templateUuid: selectedType.template.uuid }
      : formData;

    const success = await createItem(payload, selectedType.id, finalCategoryUuid);
    setLoading(false);
    if (success) handleClose();
  };

  const renderForm = () => {
    const defaultVals = prefilledPassword ? { password: prefilledPassword } : {};
    
    switch (selectedType?.id) {
      case 'login': return <LoginForm defaultValues={defaultVals} onSubmit={handleCreate} isLoading={loading} onCancel={handleClose} categories={categories} />;
      case 'credit_card': return <CreditCardForm onSubmit={handleCreate} isLoading={loading} onCancel={handleClose} categories={categories} />;
      case 'secure_note': return <SecureNoteForm onSubmit={handleCreate} isLoading={loading} onCancel={handleClose} categories={categories} />;
      case 'custom': return <CustomTemplateForm template={selectedType.template} onSubmit={handleCreate} isLoading={loading} onCancel={handleClose} categories={categories} />;
      default: return <SecureNoteForm onSubmit={handleCreate} isLoading={loading} onCancel={handleClose} categories={categories} />;
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size={step === 1 ? 'lg' : 'md'}
      title={
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="p-1 -ml-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <span>{step === 1 ? 'Choose Item Type' : `New ${selectedType?.name || 'Item'}`}</span>
        </div>
      }
    >
      {step === 1 ? (
        <div className="space-y-6">
          {/* Standard Types */}
          <div>
            <h3 className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">Standard Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ITEM_TYPES.map(type => (
                <Card 
                  key={type.id} 
                  padding="sm" 
                  hover 
                  clickable 
                  onClick={() => { setSelectedType(type); setStep(2); }}
                  className="flex items-start gap-4 border-[var(--border)]"
                >
                  <div className="h-10 w-10 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)] flex items-center justify-center shrink-0">
                    <ItemTypeIcon type={type.id} className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{type.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{type.desc}</p>
                  </div>
                </Card>
              ))}
              
              {!isLoadingTemplates && systemTemplates.map((tpl) => (
                <Card 
                  key={tpl.uuid || tpl._id} 
                  padding="sm" 
                  hover 
                  clickable 
                  onClick={() => { 
                    setSelectedType({ id: 'custom', name: tpl.name, template: tpl }); 
                    setStep(2); 
                  }}
                  className="flex items-start gap-4 border-[var(--border)]"
                >
                  <div className="h-10 w-10 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)] flex items-center justify-center shrink-0">
                    <ItemTypeIcon type={tpl.name.toLowerCase().replace(/ /g, '_')} className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{tpl.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">System template</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* NEW: Custom Templates */}
          {isLoadingTemplates ? (
            <div className="text-sm text-[var(--text-muted)] py-2">Loading templates...</div>
          ) : customTemplates.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">My Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customTemplates.map((tpl) => (
                  <Card 
                    key={tpl.uuid || tpl._id} 
                    padding="sm" 
                    hover 
                    clickable 
                    // FIX IS HERE: passing the whole 'tpl' object into 'template'
                    onClick={() => { 
                      setSelectedType({ id: 'custom', name: tpl.name, template: tpl }); 
                      setStep(2); 
                    }}
                    className="flex items-start gap-4 border-[var(--border)]"
                  >
                    <div className="h-10 w-10 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--text-secondary)]">
                      <Box className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{tpl.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tpl.fields?.length || 0} fields</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      ) : (
        <div className="mt-2">
          {renderForm()}
        </div>
      )}
    </Modal>
  );
};