import { encryptData, decryptData } from '../crypto/vaultCrypto';

export const exportVaultAsEncryptedJSON = async (vaultItems, categories, templates, encryptionKey, userId) => {
  const payload = {
    items: vaultItems,
    categories,
    templates
  };

  const { encryptedData, iv, authTag } = await encryptData(payload, encryptionKey);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userIdHash: userId, // Used for loose verification, real security is the encryption key
    encryptedBackup: encryptedData,
    iv,
    authTag
  };
};

export const downloadBackupFile = (backupObject) => {
  const jsonString = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `passwordsaver-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importBackupFile = async (file, encryptionKey) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);

        if (parsed.version !== '1.0' || !parsed.encryptedBackup || !parsed.iv || !parsed.authTag) {
          throw new Error('INVALID_FILE: The file format is not recognized or is corrupted.');
        }

        let decrypted;
        try {
          decrypted = await decryptData(parsed.encryptedBackup, parsed.iv, parsed.authTag, encryptionKey);
        } catch (decErr) {
          throw new Error('WRONG_PASSWORD: The password provided does not match the backup.');
        }

        if (!Array.isArray(decrypted.items) || !Array.isArray(decrypted.categories)) {
          throw new Error('CORRUPTED_DATA: Decrypted payload has an invalid structure.');
        }

        resolve({
          items: decrypted.items,
          categories: decrypted.categories,
          templates: decrypted.templates || [],
          exportedAt: parsed.exportedAt
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('INVALID_FILE: Failed to read the file.'));
    reader.readAsText(file);
  });
};

export const verifyBackupIntegrity = (importedData) => {
  const warnings = [];
  let validItemsCount = 0;
  let validCategoryCount = 0;

  if (!importedData.items || !importedData.categories) {
    return { isValid: false, itemCount: 0, categoryCount: 0, warnings: ['Missing core data structures'] };
  }

  importedData.items.forEach((item, idx) => {
    if (!item.uuid || !item.encryptedData || !item.iv || !item.authTag || !item.itemType) {
      warnings.push(`Item at index ${idx} is missing required cryptographic fields and will be skipped.`);
    } else {
      validItemsCount++;
    }
  });

  importedData.categories.forEach((cat, idx) => {
    if (!cat.uuid || !cat.name) {
      warnings.push(`Category at index ${idx} is invalid.`);
    } else {
      validCategoryCount++;
    }
  });

  return {
    isValid: validItemsCount > 0 || validCategoryCount > 0,
    itemCount: validItemsCount,
    categoryCount: validCategoryCount,
    warnings
  };
};