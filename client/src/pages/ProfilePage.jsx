import React, { useState } from 'react';
import { User, Edit2, Check, X } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { PasswordInput } from '../components/ui/PasswordInput';
import { useAuthStore } from '../store/authStore';
import { accountApi } from '../services/accountApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ newUsername: user?.username || '', currentPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!formData.newUsername || !formData.currentPassword) return;
    setLoading(true);
    try {
      const res = await accountApi.updateUsername(formData);
      setUser(res.data.user);
      setIsEditing(false);
      setFormData({ ...formData, currentPassword: '' });
      toast.success('Username updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Your Profile</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account details.</p>
      </div>

      <Card padding="lg" className="border-[var(--border)] flex flex-col md:flex-row items-start gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-32 w-32 rounded-full bg-[var(--accent-subtle)] border-4 border-[var(--bg-primary)] shadow-md flex items-center justify-center text-4xl font-bold text-[var(--accent)] uppercase tracking-wider">
            {user?.username.slice(0, 2)}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">ID: {user?.uuid.split('-')[0]}...</span>
        </div>

        <div className="flex-1 space-y-6 w-full">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Username</label>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-medium text-[var(--text-primary)]">{user?.username}</span>
                  <Button variant="ghost" size="sm" leftIcon={Edit2} onClick={() => setIsEditing(true)}>Edit</Button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Account Created</label>
                <div className="mt-1 text-sm text-[var(--text-primary)]">
                  {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Change Username</h3>
              <Input 
                label="New Username" 
                value={formData.newUsername} 
                onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })} 
              />
              <PasswordInput 
                label="Current Password to Confirm" 
                value={formData.currentPassword} 
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} 
              />
              <div className="flex gap-2 pt-2">
                <Button variant="primary" size="sm" onClick={handleUpdate} loading={loading} leftIcon={Check}>Save</Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setFormData({ ...formData, currentPassword: '' }); }} leftIcon={X}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};