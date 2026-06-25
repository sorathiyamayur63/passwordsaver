import React, { useState } from 'react';
import { PasswordInput, Button } from '../ui';
import { PasswordStrength } from '../auth/PasswordStrength';
import { authApi } from '../../services/authApi';
import { backupApi } from '../../services/backupApi';
import { vaultApi } from '../../services/vaultApi';
import { unlockVault, deriveSubKeys, decryptVaultItem, encryptVaultItem, decryptVaultTitle } from '../../crypto';
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
      // 1. Fetch current encrypted items
      const res = await backupApi.getBackupPayload();
      const items = res.data.items || [];

      // 2. Derive old and new keys using the same salt
      const { encryptionKey: oldKey } = await deriveSubKeys(formData.currentPassword, user.vaultKeySalt);
      const { encryptionKey: newKey } = await deriveSubKeys(formData.newPassword, user.vaultKeySalt);

      // 3. Decrypt and Re-encrypt all items
      const reencryptedItems = await Promise.all(items.map(async (item) => {
        const decryptedData = await decryptVaultItem(item, oldKey);
        
        let decryptedTitle = null;
        if (item.encryptedTitle && item.titleIv && item.titleAuthTag) {
            decryptedTitle = await decryptVaultTitle(item.encryptedTitle, item.titleIv, item.titleAuthTag, oldKey);
        } else if (item.encryptedTitle && item.titleIv && !item.titleAuthTag) {
            // Legacy items without titleAuthTag won't be able to decrypt title
            // Fallback to primary decrypted data's title
            decryptedTitle = decryptedData.title;
        } else {
            decryptedTitle = decryptedData.title;
        }

        const dataToEncrypt = { ...decryptedData, title: decryptedTitle || decryptedData.title };
        const newEncrypted = await encryptVaultItem(dataToEncrypt, newKey);

        return {
          ...item,
          encryptedData: newEncrypted.encryptedData,
          iv: newEncrypted.iv,
          authTag: newEncrypted.authTag,
          encryptedTitle: newEncrypted.encryptedTitle,
          titleIv: newEncrypted.titleIv,
          titleAuthTag: newEncrypted.titleAuthTag
        };
      }));

      // 4. Change password
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      });

      // 5. Bulk update the re-encrypted items
      if (reencryptedItems.length > 0) {
        await vaultApi.bulkUpdateVaultItems(reencryptedItems);
      }

      // Re-derive client-side vault key automatically so vault remains accessible
      await unlockVault(formData.newPassword, user.vaultKeySalt);
      toast.success('Password changed and vault re-encrypted. Other sessions logged out.');
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