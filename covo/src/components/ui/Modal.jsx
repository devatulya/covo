import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  className,
  contentClassName,
}) {
  React.useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center px-3 py-3 sm:items-center sm:px-6 sm:py-6">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-neoOverlay backdrop-blur-[2px]"
      />

      <div
        className={twMerge(
          clsx(
            'surface-panel relative z-10 w-full max-w-2xl border-[3px] border-neoBorder shadow-neo',
            className,
          ),
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b-[3px] border-neoBorder px-4 py-4 sm:px-6">
          <div>
            {subtitle ? (
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{subtitle}</p>
            ) : null}
            <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoYellow text-neoText shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <X className="h-4 w-4 stroke-[3px]" />
          </button>
        </div>

        <div className={twMerge(clsx('max-h-[75vh] overflow-y-auto p-4 sm:p-6', contentClassName))}>{children}</div>
      </div>
    </div>
  );
}
