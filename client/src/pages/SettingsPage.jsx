import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Monitor, Lock, Download, Bell } from 'lucide-react';
import { Card, Button, Toggle } from '../components/ui';
import { ChangePasswordForm } from '../components/settings/ChangePasswordForm';
import { DangerZone } from '../components/settings/DangerZone';
import { useTheme } from '../store/themeStore';
import { backupApi } from '../services/backupApi';
import { useAuthStore } from '../store/authStore';
import { getKey } from '../crypto';
import { exportVaultAsEncryptedJSON, downloadBackupFileAsJSON } from '../utils/backupUtils';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export const SettingsPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'security');
  const { theme, setTheme } = useTheme();
  const { user } = useAuthStore();
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const handleExportData = useCallback(async () => {
    setExportingData(true);
    try {
      const res = await backupApi.getBackupPayload();
      const currentKey = getKey();
      const backupObj = await exportVaultAsEncryptedJSON(
        res.data.items,
        res.data.categories,
        res.data.templates,
        currentKey,
        user?.uuid
      );
      downloadBackupFileAsJSON(backupObj);
      toast.success('Encrypted backup downloaded as JSON');
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setExportingData(false);
    }
  }, [user]);

  const TABS = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account preferences and security settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-[var(--accent-subtle)] text-[var(--accent-text)]" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'security' && (
            <>
              <Card padding="lg" className="border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 mb-6">Change Password</h2>
                <ChangePasswordForm />
              </Card>

              <Card padding="lg" className="border-[var(--border)] space-y-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Vault Timeouts</h2>
                
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">Vault Idle Timeout</label>
                  <select className="w-full max-w-xs h-10 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm focus:ring-[var(--border-focus)]">
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="240">4 Hours</option>
                  </select>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Automatically lock the vault after inactivity.</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">Clipboard Clear Timeout</label>
                  <select className="w-full max-w-xs h-10 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm focus:ring-[var(--border-focus)]">
                    <option value="30">30 Seconds</option>
                    <option value="60">60 Seconds</option>
                    <option value="300">5 Minutes</option>
                  </select>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'appearance' && (
            <Card padding="lg" className="border-[var(--border)] space-y-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">Appearance</h2>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] block mb-3">Theme Preference</label>
                <div className="flex gap-4">
                  {['light', 'dark', 'system'].map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="theme" 
                        value={t} 
                        checked={theme === t} 
                        onChange={() => setTheme(t)}
                        className="text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <span className="text-sm text-[var(--text-primary)] capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <Card padding="lg" className="border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 mb-4">Export Data</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Download a complete backup of your vault. Your vault is exported in its encrypted form. Only you can decrypt it using your Password.
                </p>
                <Button leftIcon={Download} variant="secondary" loading={exportingData} onClick={handleExportData}>Download Encrypted Backup (.json)</Button>
              </Card>

              <DangerZone />
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card padding="lg" className="border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 mb-6">Notifications</h2>
              <Toggle checked={true} onChange={() => {}} label="Notify me about expiring items (cards, passports)" />
              <div className="mt-4">
                <Toggle checked={false} onChange={() => {}} label="Email me when a new device logs in" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};