import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useVault } from '../hooks/useVault';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Star, Fingerprint, Activity } from 'lucide-react';
import { Card, Button } from '../components/ui';
import { VaultItemModal } from '../components/vault/VaultItemModal';
import { templateApi } from '../services/templateApi';
import { normalizeTemplate } from '../utils/templateFields';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, fetchItems, fetchCategories, updateItem, deleteItem } = useVault();
  const [selectedItem, setSelectedItem] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);
  
  const itemUuid = searchParams.get('item');

  useEffect(() => {
    fetchItems();
    fetchCategories();

    const loadTemplates = async () => {
      try {
        const res = await templateApi.getTemplates();
        const loadedTemplates = Array.isArray(res.data?.templates) ? res.data.templates : [];
        setCustomTemplates(loadedTemplates.filter(template => !template.isSystem).map(normalizeTemplate));
      } catch (error) {
        setCustomTemplates([]);
      }
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!itemUuid || !items.length) return;
    const matchedItem = items.find(item => item.uuid === itemUuid);
    if (matchedItem) {
      setSelectedItem(matchedItem);
      setSearchParams({}, { replace: true });
    }
  }, [itemUuid, items, setSearchParams]);

  const favoritesCount = items.filter(i => i.isFavorite).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back, {user?.username}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Your vault is unlocked and synced.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={ShieldCheck} label="Secured Items" value={items.length} />
        <MetricCard icon={Star} label="Favorites" value={favoritesCount} color="var(--warning)" />
        <MetricCard icon={Fingerprint} label="Security Score" value="98%" color="var(--success)" />
        <MetricCard icon={Activity} label="Last Active" value="Just now" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Card padding="md" hover clickable onClick={() => navigate('/vault')} className="text-center flex flex-col items-center justify-center h-32">
               <ShieldCheck className="h-6 w-6 text-[var(--accent)] mb-2" />
               <span className="text-sm font-medium">Add Login</span>
             </Card>
             <Card padding="md" hover clickable onClick={() => navigate('/generator')} className="text-center flex flex-col items-center justify-center h-32">
               <Fingerprint className="h-6 w-6 text-[var(--accent)] mb-2" />
               <span className="text-sm font-medium">Generate Password</span>
             </Card>
             <Card padding="md" hover clickable onClick={() => navigate('/security')} className="text-center flex flex-col items-center justify-center h-32 bg-[var(--accent-subtle)] border-[var(--accent)]">
               <Activity className="h-6 w-6 text-[var(--accent)] mb-2" />
               <span className="text-sm font-medium text-[var(--accent-text)]">Security Audit</span>
             </Card>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <Card padding="none" className="overflow-hidden">
            <div className="divide-y divide-[var(--border)]">
              {items.slice(0, 4).map(item => (
                <div key={item.uuid} onClick={() => navigate(`?item=${item.uuid}`)} className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 truncate">
                    <div className="h-8 w-8 rounded bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
                      <Star className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {item.decryptedData?.title || 'Untitled'}
                    </span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-8 text-center text-sm text-[var(--text-muted)]">No recent activity.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <VaultItemModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem}
        template={customTemplates.find(template => template.uuid === selectedItem?.templateUuid) || null}
        onUpdate={updateItem}
        onDelete={(uuid) => { deleteItem(uuid); setSelectedItem(null); }}
      />
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <Card padding="md" className="flex items-center gap-4">
    <div className="h-12 w-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
      <Icon className="h-6 w-6" style={{ color: color || 'var(--text-secondary)' }} />
    </div>
    <div>
      <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
    </div>
  </Card>
);