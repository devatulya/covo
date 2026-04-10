import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({ className, ...props }) {
  return (
    <input 
      className={twMerge(clsx(
        "w-full h-12 px-4 py-2 text-sm font-medium bg-white text-neoText placeholder-slate-500 border-[3px] border-neoBorder shadow-neo focus:outline-none focus:shadow-neo-lg transition-shadow",
        className
      ))}
      {...props}
    />
  );
}
