import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Card, Button, Modal, Input, PasswordInput, Toggle } from '../ui';
import { accountApi } from '../../services/accountApi';
import { useAuthStore } from '../../store/authStore';
import { clearKey } from '../../crypto';
import toast from 'react-hot-toast';

export const DangerZone = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', understood: false });
  const [loading, setLoading] = useState(false);
  
  const user = useAuthStore(state => state.user);
  const clearUser = useAuthStore(state => state.clearUser);
  const navigate = useNavigate();

  const isFormValid = formData.username === user?.username && formData.password.length > 0 && formData.understood;

  const handleDelete = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      await accountApi.deleteAccount({ username: formData.username, password: formData.password });
      clearUser();
      clearKey();
      toast.success('Account permanently deleted');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <>
      <Card padding="md" className="border-[var(--danger)] bg-[var(--danger-subtle)]">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-[var(--danger)] shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-[var(--danger-text)]">Danger Zone</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-4">
              Permanently delete your account and all encrypted data. This action cannot be undone.
            </p>
            <Button variant="danger" onClick={() => setIsOpen(true)}>Delete Account</Button>
          </div>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Account Permanently" size="md">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            This will permanently delete your account, vault items, categories, templates, and history. <strong>There is no recovery.</strong>
          </p>
          
          <Input 
            label={`Type "${user?.username}" to confirm`} 
            value={formData.username} 
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
          />
          
          <PasswordInput 
            label="Password" 
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          />
          
          <div className="pt-2">
            <Toggle 
              checked={formData.understood} 
              onChange={(c) => setFormData({ ...formData, understood: c })} 
              label="I understand my data will be permanently deleted" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="danger" disabled={!isFormValid || loading} loading={loading} onClick={handleDelete}>
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};