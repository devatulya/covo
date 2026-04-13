import React from 'react';
import { ArrowLeft, BarChart2, ChevronDown, Image, Link2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DraftsModal } from '../components/modals/DraftsModal';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useUiStore } from '../store/uiStore';

const zones = ['Campus Pulse', 'Library Board', 'Weekend Warriors', 'Design Dungeon'];

export function CreatePost() {
  const navigate = useNavigate();
  const [ghostMode, setGhostMode] = React.useState(false);
  const [selectedZone, setSelectedZone] = React.useState(zones[0]);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [title, setTitle] = React.useState('');

  const { openDrafts, closeDrafts, getDraftById } = useUiStore((state) => ({
    openDrafts: state.openDrafts,
    closeDrafts: state.closeDrafts,
    getDraftById: state.getDraftById,
  }));

  const characterCount = content.length;

  const handleRestoreDraft = (draftId) => {
    const draft = getDraftById(draftId);

    if (!draft) {
      return;
    }

    setTitle(draft.title);
    setContent(draft.content);
    setSelectedZone(draft.zone);
    setGhostMode(draft.ghostMode);
    closeDrafts();
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      return;
    }

    navigate('/');
  };

  return (
    <>
      <div className="flex min-h-screen flex-col bg-neoBg pb-20">
        <div className="surface-panel sticky top-0 z-30 border-b-[3px] border-neoBorder px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoCyan shadow-neo-sm"
            >
              <ArrowLeft className="h-5 w-5 stroke-[3px]" />
            </Link>

            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Create</p>
              <h1 className="text-lg font-black uppercase tracking-tight">New Blast</h1>
            </div>

            <button
              type="button"
              onClick={openDrafts}
              className="border-[3px] border-neoBorder bg-neoYellow px-3 py-2 text-[10px] font-black uppercase shadow-neo-sm"
            >
              Drafts
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 md:px-6 md:py-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">Headline</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Name your blast..."
              className="h-14 w-full border-[3px] border-neoBorder bg-neoSurface px-4 text-sm font-bold text-neoText shadow-neo outline-none placeholder:text-neoMuted"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="flex w-full items-center justify-between border-[3px] border-neoBorder bg-neoYellow px-4 py-4 text-left text-sm font-black uppercase shadow-neo"
            >
              <span className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.2em] text-neoMuted">Select zone</span>
                <span>{selectedZone}</span>
              </span>
              <ChevronDown className={`h-5 w-5 stroke-[3px] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen ? (
              <div className="surface-panel absolute left-0 right-0 top-[calc(100%+8px)] z-20 border-[3px] border-neoBorder shadow-neo">
                {zones.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => {
                      setSelectedZone(zone);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between border-b-[3px] border-neoBorder px-4 py-3 text-left text-sm font-bold uppercase last:border-b-0 ${
                      zone === selectedZone ? 'bg-neoCyan text-neoText' : 'hover:bg-neoSurfaceMuted'
                    }`}
                  >
                    {zone}
                    {zone === selectedZone ? <Sparkles className="h-4 w-4 stroke-[3px]" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="surface-panel flex flex-1 flex-col border-[3px] border-neoBorder shadow-neo">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value.slice(0, 280))}
              className="min-h-[280px] flex-1 resize-none bg-transparent p-4 text-sm font-bold leading-relaxed text-neoText outline-none placeholder:text-neoMuted"
              placeholder="Spill the tea... what's happening on campus?"
            />

            <div className="flex items-center justify-between border-t-[3px] border-neoBorder px-4 py-3">
              <div className="flex items-center gap-3 text-neoMuted">
                <Image className="h-5 w-5 stroke-[2.5px]" />
                <Link2 className="h-5 w-5 stroke-[2.5px]" />
                <BarChart2 className="h-5 w-5 stroke-[2.5px]" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">{characterCount}/280</span>
            </div>
          </div>

          <div className="surface-panel mt-auto flex items-center justify-between gap-4 border-[3px] border-neoBorder p-4 shadow-neo">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Ghost mode</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-neoMuted">
                Post anonymously to this zone while keeping the same retro vibe.
              </p>
            </div>

            <ToggleSwitch checked={ghostMode} onChange={setGhostMode} aria-label="Toggle ghost mode" />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full border-[3px] border-neoBorder bg-neoPink py-4 text-xl font-black uppercase text-white shadow-neo disabled:cursor-not-allowed disabled:opacity-50"
          >
            Blast it
          </button>
        </div>
      </div>

      <DraftsModal onRestore={handleRestoreDraft} />
    </>
  );
}
