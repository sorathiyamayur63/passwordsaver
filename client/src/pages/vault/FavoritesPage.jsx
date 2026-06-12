import React, { useMemo, useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { VaultItemCard } from '../../components/vault/VaultItemCard';
import { useVault } from '../../hooks/useVault';
import { VaultItemModal } from '../../components/vault/VaultItemModal';
import { templateApi } from '../../services/templateApi';
import { normalizeTemplate } from '../../utils/templateFields';

export const FavoritesPage = () => {
  //const { items, viewMode, toggleFavorite } = useVault();
  //chage with next two line
  const { items, viewMode, toggleFavorite, updateItem, deleteItem } = useVault();
  const [selectedItem, setSelectedItem] = useState(null);
  const [customTemplates, setCustomTemplates] = useState([]);

  useEffect(() => {
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
  // Filter only favorites
  const favoriteItems = useMemo(() => items.filter(item => item.isFavorite), [items]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Favorites</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Your most accessed secured items.</p>
      </div>

      {favoriteItems.length === 0 ? (
        <EmptyState 
          icon={Star} 
          title="No favorites yet" 
          description="Click the star icon on any vault item to add it to your favorites." 
        />
      ) : (
        <div className={viewMode === 'list' ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
          {favoriteItems.map(item => (
            <VaultItemCard 
              key={item.uuid} 
              item={item} 
              viewMode={viewMode} 
              //onClick={() => {}} // Handle opening modal logic
              onClick={setSelectedItem}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    <VaultItemModal
  isOpen={!!selectedItem}
  onClose={() => setSelectedItem(null)}
  item={selectedItem}
  template={customTemplates.find(template => template.uuid === selectedItem?.templateUuid) || null}
  onUpdate={updateItem}
  onDelete={(uuid) => {
    deleteItem(uuid);
    setSelectedItem(null);
  }}
/>

    </div>
  );
};