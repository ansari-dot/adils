import React, { useState } from 'react';
import { CakeSlice } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | '4/3' | 'auto';
}

export function ImageWithFallback({
  src,
  alt = 'Bakery asset',
  fallbackTitle,
  className = '',
  aspectRatio = 'auto',
  ...rest
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : '';

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60 text-stone-400 dark:text-stone-500 overflow-hidden select-none ${aspectClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        <CakeSlice className="w-6 h-6 stroke-[1.5] text-amber-700/60 dark:text-amber-500/60" />
        {fallbackTitle && (
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-1 max-w-[85%] truncate text-center px-1">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${aspectClass} ${className}`}
      {...rest}
    />
  );
}
