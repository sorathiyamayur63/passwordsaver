import React from 'react';
import { Star, MoreVertical } from 'lucide-react';
import { Card, Badge, Tooltip } from '../ui';
import { ItemTypeIcon } from './ItemTypeIcon';
import { FaviconOrIcon } from './FaviconOrIcon';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

export const VaultItemCard = ({ item, viewMode = 'list', onClick, onToggleFavorite }) => {
  const { decryptedData, itemType, isFavorite, lastModifiedAt } = item;
  const title = decryptedData?.title || 'Untitled Item';

  const handleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite(item);
  };

  if (viewMode === 'list') {
    return (
      <Card 
        padding="sm" 
        hover 
        clickable 
        onClick={() => onClick(item)}
        className="flex items-center gap-4 group"
      >
        <div className="h-10 w-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
          <FaviconOrIcon url={decryptedData?.website || decryptedData?.url} type={itemType} className="h-full w-full object-cover" fallbackClassName="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{title}</h4>
          <p className="text-xs text-[var(--text-muted)] truncate">
            {decryptedData?.username || decryptedData?.website || (itemType || 'unknown').replace('_', ' ')}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--text-muted)] whitespace-nowrap">
          <span>{lastModifiedAt ? formatDistanceToNow(new Date(lastModifiedAt)) + ' ago' : ''}</span>
          <Badge variant="default" size="sm">{(itemType || 'unknown').replace('_', ' ')}</Badge>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={handleFavorite}
            className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none"
          >
            <Star className={cn("h-4 w-4 transition-colors", isFavorite ? "text-[var(--warning)] fill-[var(--warning)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]")} />
          </button>
          <button className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] opacity-0 group-hover:opacity-100 transition-all">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </Card>
    );
  }

  // Grid mode mapping...
  return (
    <Card padding="md" hover clickable onClick={() => onClick(item)} className="flex flex-col h-full relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
          <FaviconOrIcon url={decryptedData?.website || decryptedData?.url} type={itemType} className="h-full w-full object-cover" fallbackClassName="h-6 w-6 text-[var(--text-secondary)]" />
        </div>
        <button onClick={handleFavorite} className="p-1">
          <Star className={cn("h-5 w-5", isFavorite ? "text-[var(--warning)] fill-[var(--warning)]" : "text-[var(--text-muted)]")} />
        </button>
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)] truncate mb-1">{title}</h4>
      <p className="text-sm text-[var(--text-muted)] truncate mb-4 flex-1">
        {decryptedData?.username || (itemType || 'unknown').replace('_', ' ')}
      </p>
      <div className="text-xs text-[var(--text-disabled)] mt-auto pt-4 border-t border-[var(--border)]">
        {lastModifiedAt ? `Updated ${formatDistanceToNow(new Date(lastModifiedAt))} ago` : 'Recently added'}
      </div>
    </Card>
  );
};