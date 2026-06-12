import React, { useState } from 'react';
import { PasswordInput, Button } from '../ui';
import { PasswordStrength } from '../auth/PasswordStrength';
import { authApi } from '../../services/authApi';
import { unlockVault } from '../../crypto';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(state => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      return toast.error('New passwords do not match');
    }
    
    setLoading(true);
    try {
      await authApi.changePassword(formData);
      // Re-derive client-side vault key automatically so vault remains accessible
      await unlockVault(formData.newPassword, user.vaultKeySalt);
      toast.success('Password changed. Other sessions logged out.');
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <PasswordInput
        label="Current Password"
        value={formData.currentPassword}
        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
        required
      />
      <div>
        <PasswordInput
          label="New Password"
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          required
        />
        <div className="mt-1"><PasswordStrength password={formData.newPassword} /></div>
      </div>
      <PasswordInput
        label="Confirm New Password"
        value={formData.confirmNewPassword}
        onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
        required
      />
      <div className="pt-2">
        <Button type="submit" loading={loading} disabled={!formData.newPassword || formData.newPassword !== formData.confirmNewPassword}>
          Update Password
        </Button>
      </div>
    </form>
  );
};