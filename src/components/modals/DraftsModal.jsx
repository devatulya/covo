import React from 'react';
import { FileText, Ghost, RotateCcw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useUiStore } from '../../store/uiStore';

export function DraftsModal({ onRestore }) {
  const { isDraftsOpen, closeDrafts, drafts } = useUiStore((state) => ({
    isDraftsOpen: state.isDraftsOpen,
    closeDrafts: state.closeDrafts,
    drafts: state.drafts,
  }));

  return (
    <Modal open={isDraftsOpen} onClose={closeDrafts} title="Drafts" subtitle="Saved noise">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="max-w-md text-sm font-bold leading-relaxed text-neoMuted">
          Jump back into unfinished blasts without rebuilding them from scratch.
        </p>
        <div className="border-[3px] border-neoBorder bg-neoCyan px-4 py-2 text-[10px] font-black uppercase shadow-neo-sm">
          {drafts.length} saved
        </div>
      </div>

      <div className="space-y-4">
        {drafts.map((draft) => (
          <article
            key={draft.id}
            className="surface-panel flex flex-col gap-4 border-[3px] border-neoBorder p-4 shadow-neo-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-neoBorder bg-neoYellow">
                <FileText className="h-5 w-5 stroke-[3px] text-neoText" />
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wide">{draft.title}</h3>
                  {draft.ghostMode ? (
                    <span className="inline-flex items-center gap-1 border-[3px] border-neoBorder bg-neoPink px-2 py-0.5 text-[10px] font-black uppercase text-white">
                      <Ghost className="h-3 w-3 stroke-[3px]" />
                      Ghost
                    </span>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-neoMuted">{draft.content}</p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">
                  {draft.zone} | {draft.updatedAt}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRestore(draft.id)}
              className="inline-flex items-center justify-center gap-2 border-[3px] border-neoBorder bg-neoYellow px-4 py-3 text-xs font-black uppercase shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <RotateCcw className="h-4 w-4 stroke-[3px]" />
              Restore
            </button>
          </article>
        ))}
      </div>
    </Modal>
  );
}
