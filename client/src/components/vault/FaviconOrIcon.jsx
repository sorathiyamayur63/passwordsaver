import React, { useState } from 'react';
import { ItemTypeIcon } from './ItemTypeIcon';

export const FaviconOrIcon = ({ url, type, className, fallbackClassName = 'h-5 w-5 text-[var(--text-secondary)]' }) => {
  const [error, setError] = useState(false);

  let domain = null;
  if (url && typeof url === 'string') {
    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      const u = new URL(cleanUrl);
      domain = u.hostname;
    } catch (e) {
      domain = null;
    }
  }

  if (domain && !error) {
    return (
      <img 
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        className={className || "h-6 w-6 rounded-sm object-contain"}
        onError={() => setError(true)}
      />
    );
  }

  return <ItemTypeIcon type={type} className={fallbackClassName} />;
};
