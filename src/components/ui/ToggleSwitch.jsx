import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function ToggleSwitch({ checked, onChange, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={twMerge(
        clsx(
          'inline-flex h-8 w-14 items-center border-[3px] border-neoBorder px-[3px] shadow-neo-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
          checked ? 'justify-end bg-neoCyan' : 'justify-start bg-neoSurfaceMuted',
          className,
        ),
      )}
      {...props}
    >
      <span className="block h-[18px] w-[18px] border-[3px] border-neoBorder bg-neoSurface" />
    </button>
  );
}
