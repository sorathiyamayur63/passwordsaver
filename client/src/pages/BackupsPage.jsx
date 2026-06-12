import React, { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, ShieldCheck, FileJson } from 'lucide-react';
import { Card, Button, Input, Toggle, PasswordInput, Spinner } from '../components/ui';
import { backupApi } from '../services/backupApi';
import { useAuthStore } from '../store/authStore';
import { getKey, deriveSubKeys } from '../crypto';
import { exportVaultAsEncryptedJSON, downloadBackupFile, importBackupFile, verifyBackupIntegrity } from '../utils/backupUtils';
import toast from 'react-hot-toast';

export const BackupsPage = () => {
  const { user } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  
  const [file, setFile] = useState(null);
  const [importPassword, setImportPassword] = useState('');
  const [importMode, setImportMode] = useState('merge'); // 'merge' or 'replace'
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await backupApi.getBackupPayload();
      const currentKey = getKey();
      
      const backupObj = await exportVaultAsEncryptedJSON(
        res.data.items, 
        res.data.categories, 
        res.data.templates, 
        currentKey,
        user.uuid
      );
      
      downloadBackupFile(backupObj);
      toast.success('Encrypted backup downloaded successfully');
    } catch (err) {
      toast.error('Failed to export backup');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !importPassword) return;
    setImporting(true);
    try {
      let parsedData;
      try {
        const { encryptionKey } = await deriveSubKeys(importPassword, user.vaultKeySalt);
        parsedData = await importBackupFile(file, encryptionKey);
      } catch (err) {
        if (err.message.includes('WRONG_PASSWORD')) {
          try {
            const legacyRes = await deriveSubKeys(importPassword, undefined);
            parsedData = await importBackupFile(file, legacyRes.encryptionKey);
          } catch (legacyErr) {
            throw err; // Throw original error if legacy fallback also fails
          }
        } else {
          throw err;
        }
      }
      
      const integrity = verifyBackupIntegrity(parsedData);
      if (!integrity.isValid) {
        throw new Error(integrity.warnings[0] || 'Corrupted backup data');
      }

      await backupApi.restoreBackup({ ...parsedData, mode: importMode });
      
      toast.success(`Restored ${integrity.itemCount} items successfully`);
      setFile(null);
      setImportPassword('');
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backups</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Export encrypted backups or restore from an archive.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card padding="lg" className="border-[var(--border)] flex flex-col">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--border)] pb-3">
            <Download className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Export Vault</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1">
            Download a complete, offline backup of your vault. Your backup is encrypted with your password via AES-256-GCM. No one else can read it.
          </p>
          <div className="space-y-4">
            <div className="bg-[var(--bg-secondary)] p-3 rounded-md border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
              <p className="font-semibold text-[var(--text-primary)]">What's included:</p>
              <p>• All Vault Items & Passwords</p>
              <p>• Custom Categories</p>
              <p>• Custom Templates</p>
            </div>
            <Button className="w-full" leftIcon={Download} onClick={handleExport} loading={exporting}>
              Download Encrypted Backup
            </Button>
          </div>
        </Card>

        {/* Import Section */}
        <Card padding="lg" className="border-[var(--border)] flex flex-col">
          <div className="flex items-center gap-3 mb-4 border-b border-[var(--border)] pb-3">
            <Upload className="h-5 w-5 text-[var(--warning)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Restore Backup</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            {!file ? (
              <div 
                className="border-2 border-dashed border-[var(--border-strong)] rounded-lg p-6 text-center hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" accept=".psv,.json" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                <FileJson className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm font-medium text-[var(--text-primary)]">Click to select backup file</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Accepts .psv or .json</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[var(--bg-secondary)] p-3 rounded-md border border-[var(--border)] flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Import Mode</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-[var(--text-primary)]">
                      <input type="radio" name="mode" value="merge" checked={importMode === 'merge'} onChange={(e) => setImportMode(e.target.value)} className="text-[var(--accent)] focus:ring-[var(--accent)]" /> Merge with existing
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-[var(--danger)]">
                      <input type="radio" name="mode" value="replace" checked={importMode === 'replace'} onChange={(e) => setImportMode(e.target.value)} className="text-[var(--danger)] focus:ring-[var(--danger)]" /> Replace all
                    </label>
                  </div>
                  
                  {importMode === 'replace' && (
                    <div className="flex items-start gap-2 text-xs text-[var(--danger)] bg-[var(--danger-subtle)] p-2 rounded border border-[var(--danger)]">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <p>Warning: This will permanently delete your current vault items before restoring.</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <PasswordInput 
                    label="Backup Password" 
                    placeholder="Password used when exporting"
                    value={importPassword} 
                    onChange={(e) => setImportPassword(e.target.value)} 
                    disabled={importing}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <Button className="w-full" variant="primary" disabled={!file || !importPassword || importing} loading={importing} onClick={handleImport}>
              Decrypt & Restore
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};