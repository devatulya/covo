import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({ className, ...props }) {
  return (
    <input 
      className={twMerge(clsx(
        "w-full h-12 border-[3px] border-neoBorder bg-neoSurface px-4 py-2 text-sm font-medium text-neoText shadow-neo placeholder:text-neoMuted focus:outline-none focus:shadow-neo-lg transition-shadow",
        className
      ))}
      {...props}
    />
  );
}
