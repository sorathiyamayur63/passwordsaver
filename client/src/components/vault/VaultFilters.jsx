import React from 'react';
import { Filter, X } from 'lucide-react';
import { Toggle, Button } from '../ui';
import { useVaultStore } from '../../store/vaultStore';

export const VaultFilters = () => {
  const { sortBy, setSortBy } = useVaultStore();

  return (
    <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-4 space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Filter className="h-4 w-4 text-[var(--text-muted)]" />
          Vault Filters
        </h3>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2">Clear</Button>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Sort By</label>
        <select 
          className="w-full h-9 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] focus:ring-[var(--border-focus)]"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="lastModifiedAt">Last Modified</option>
          <option value="createdAt">Date Created</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Item Types</label>
        <div className="space-y-2">
           <Toggle checked={true} onChange={() => {}} label="Logins" size="sm" />
           <Toggle checked={true} onChange={() => {}} label="Secure Notes" size="sm" />
           <Toggle checked={true} onChange={() => {}} label="Payment Cards" size="sm" />
           <Toggle checked={true} onChange={() => {}} label="Identities" size="sm" />
        </div>
      </div>
    </div>
  );
};