import React, { useState, useEffect } from 'react';
import { API_URL } from '../../services/api';

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-xl',
  '2xl': 'w-20 h-20 text-3xl font-serif'
};

const resolveImageSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const base = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getAvatarTheme = (id = 0) => {
  const themes = [
    'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'bg-purple-500/15 text-purple-400 border-purple-500/30'
  ];
  return themes[Math.abs(Number(id) || 0) % themes.length];
};

const UserAvatar = ({
  src,
  name = 'User',
  id = 0,
  size = 'md',
  rounded = 'rounded-xl',
  border = true,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const resolvedSrc = resolveImageSrc(src);

  useEffect(() => {
    setImageError(false);
  }, [resolvedSrc]);

  // Extract first letter of name for fallback
  const cleanName = (typeof name === 'string' && name.trim()) ? name.trim() : 'User';
  const firstLetter = cleanName.charAt(0).toUpperCase() || 'U';

  const sizeClass = sizeMap[size] || size;
  const themeClass = getAvatarTheme(id);
  const borderClass = border ? 'border' : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden font-bold select-none ${sizeClass} ${rounded} ${borderClass} ${themeClass} ${className}`}
    >
      {resolvedSrc && !imageError ? (
        <img
          key={resolvedSrc}
          src={resolvedSrc}
          alt={cleanName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span className="font-mono uppercase tracking-wider">{firstLetter}</span>
      )}
    </div>
  );
};

export default UserAvatar;
