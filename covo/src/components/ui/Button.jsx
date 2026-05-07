import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:translate-x-1 active:translate-y-1 active:shadow-none border-[3px] border-neoBorder shadow-neo';
  
  const variants = {
    primary: 'bg-neoPurple text-white',
    secondary: 'bg-neoSurface text-neoText',
    yellow: 'bg-neoYellow text-neoText',
    cyan: 'bg-neoCyan text-neoText',
    pink: 'bg-neoPink text-white',
    ghost: 'border-transparent shadow-none bg-transparent hover:bg-neoSurfaceMuted text-neoText active:shadow-none active:translate-x-0 active:translate-y-0 active:scale-95',
    danger: 'bg-red-500 text-white'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-8 text-base uppercase tracking-wider',
    icon: 'h-10 w-10 p-2'
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
