import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className
}) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-24 w-24'
  };

  return (
    <div className={twMerge(clsx('overflow-hidden flex-shrink-0 border-[3px] border-neoBorder bg-neoYellow', sizes[size], className))}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-xs font-bold uppercase text-neoText">{alt.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}
