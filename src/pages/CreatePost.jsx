import React from 'react';
import { ArrowLeft, BarChart2, ChevronDown, Image, Link2, Sparkles, X, Hash, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { DraftsModal } from '../components/modals/DraftsModal';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useUiStore } from '../store/uiStore';
import { addDoc, collection } from 'firebase/firestore';
import { db, functions } from '../firebase/config';
import { useAuthStore } from '../store/authStore';

const zones = ['meme', 'rant', 'event', 'discussion'];

// Zone colour accents for the suggestion panel header
const ZONE_ACCENT = {
  meme:       'bg-neoYellow',
  rant:       'bg-neoPink',
  event:      'bg-neoGreen',
  discussion: 'bg-neoCyan',
};

export function CreatePost() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // ── Post fields ──────────────────────────────────────────────────────────
  const [ghostMode, setGhostMode]       = React.useState(false);
  const [selectedZone, setSelectedZone] = React.useState(zones[0]);
  const [menuOpen, setMenuOpen]         = React.useState(false);
  const [content, setContent]           = React.useState('');
  const [title, setTitle]               = React.useState('');

  // ── AI assistant state ───────────────────────────────────────────────────
  const [aiOpen, setAiOpen]               = React.useState(false);
  const [aiLoading, setAiLoading]         = React.useState(false);
  const [aiError, setAiError]             = React.useState('');
  const [suggestions, setSuggestions]     = React.useState(null);
  // suggestions = { captions: string[], hashtags: string[] } | null

  const { openDrafts, closeDrafts, getDraftById } = useUiStore((state) => ({
    openDrafts:   state.openDrafts,
    closeDrafts:  state.closeDrafts,
    getDraftById: state.getDraftById,
  }));

  const characterCount = content.length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRestoreDraft = (draftId) => {
    const draft = getDraftById(draftId);
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setSelectedZone(draft.zone);
    setGhostMode(draft.ghostMode);
    closeDrafts();
  };

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    try {
      await addDoc(collection(db, 'posts'), {
        userId:        user.id || user.uid,
        college:       user.college || '',
        title,
        content,
        likesCount:    0,
        commentsCount: 0,
        isFlagged:     false,
        category:      selectedZone,
        status:        ghostMode ? 'pending_review' : 'approved',
        isAnonymous:   ghostMode,
        createdAt:     new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  // ── AI: fetch suggestions ─────────────────────────────────────────────────
  const fetchSuggestions = async () => {
    setAiLoading(true);
    setAiError('');
    setSuggestions(null);

    try {
      const fn = httpsCallable(functions, 'generateCaptionSuggestions');
      const result = await fn({
        text:     content,
        category: selectedZone,
        college:  user?.college ?? '',
      });
      setSuggestions(result.data);
    } catch (err) {
      console.error('AI caption error:', err);
      setAiError(err?.message ?? 'Something went wrong. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenAi = () => {
    setAiOpen(true);
    fetchSuggestions();
  };

  // Apply a caption suggestion (replaces content)
  const applyCaption = (caption) => {
    setContent(caption.slice(0, 280));
  };

  // Append a hashtag to content
  const applyHashtag = (tag) => {
    const appended = `${content.trimEnd()} #${tag}`.trim();
    setContent(appended.slice(0, 280));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex min-h-screen flex-col bg-neoBg pb-20">

        {/* ── Header ── */}
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

          {/* ── Headline input ── */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name your blast..."
              className="h-14 w-full border-[3px] border-neoBorder bg-neoSurface px-4 text-sm font-bold text-neoText shadow-neo outline-none placeholder:text-neoMuted"
            />
          </div>

          {/* ── Zone picker ── */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((c) => !c)}
              className="flex w-full items-center justify-between border-[3px] border-neoBorder bg-neoYellow px-4 py-4 text-left text-sm font-black uppercase shadow-neo"
            >
              <span className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.2em] text-neoMuted">Select zone</span>
                <span>{selectedZone}</span>
              </span>
              <ChevronDown className={`h-5 w-5 stroke-[3px] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="surface-panel absolute left-0 right-0 top-[calc(100%+8px)] z-20 border-[3px] border-neoBorder shadow-neo">
                {zones.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => { setSelectedZone(zone); setMenuOpen(false); }}
                    className={`flex w-full items-center justify-between border-b-[3px] border-neoBorder px-4 py-3 text-left text-sm font-bold uppercase last:border-b-0 ${
                      zone === selectedZone ? 'bg-neoCyan text-neoText' : 'hover:bg-neoSurfaceMuted'
                    }`}
                  >
                    {zone}
                    {zone === selectedZone ? <Sparkles className="h-4 w-4 stroke-[3px]" /> : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Caption textarea ── */}
          <div className="surface-panel flex flex-1 flex-col border-[3px] border-neoBorder shadow-neo">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 280))}
              className="min-h-[200px] flex-1 resize-none bg-transparent p-4 text-sm font-bold leading-relaxed text-neoText outline-none placeholder:text-neoMuted"
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

          {/* ── ✨ AI Caption Assistant button ── */}
          <button
            type="button"
            onClick={handleOpenAi}
            className="flex w-full items-center justify-center gap-2 border-[3px] border-neoBorder bg-neoPurple py-3 text-sm font-black uppercase text-white shadow-neo transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Sparkles className="h-4 w-4 stroke-[3px]" />
            AI Caption Assistant
          </button>

          {/* ── Ghost mode toggle ── */}
          <div className="surface-panel mt-auto flex items-center justify-between gap-4 border-[3px] border-neoBorder p-4 shadow-neo">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em]">Ghost mode</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-neoMuted">
                Post anonymously to this zone while keeping the same retro vibe.
              </p>
            </div>
            <ToggleSwitch checked={ghostMode} onChange={setGhostMode} aria-label="Toggle ghost mode" />
          </div>

          {/* ── Submit ── */}
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

      {/* ── AI Suggestion Panel (bottom sheet) ── */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neoOverlay"
            onClick={() => setAiOpen(false)}
          />

          {/* Sheet */}
          <div className="relative z-10 surface-panel max-h-[80vh] overflow-y-auto border-t-[3px] border-neoBorder shadow-neo">

            {/* Sheet header */}
            <div className={`flex items-center justify-between border-b-[3px] border-neoBorder px-4 py-4 ${ZONE_ACCENT[selectedZone] ?? 'bg-neoPurple'}`}>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 stroke-[3px]" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">AI Caption Assistant</p>
                  <p className="text-sm font-black uppercase">Suggestions for "{selectedZone}"</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Refresh */}
                <button
                  type="button"
                  onClick={fetchSuggestions}
                  disabled={aiLoading}
                  className="flex h-9 w-9 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm disabled:opacity-40"
                  title="Regenerate suggestions"
                >
                  <RefreshCw className={`h-4 w-4 stroke-[3px] ${aiLoading ? 'animate-spin' : ''}`} />
                </button>
                {/* Close */}
                <button
                  type="button"
                  onClick={() => setAiOpen(false)}
                  className="flex h-9 w-9 items-center justify-center border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm"
                >
                  <X className="h-4 w-4 stroke-[3px]" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-5">

              {/* Loading state */}
              {aiLoading && (
                <div className="space-y-3">
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted animate-pulse">
                    Thinking...
                  </p>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-14 animate-pulse border-[3px] border-neoBorder bg-neoSurfaceMuted" />
                  ))}
                </div>
              )}

              {/* Error state */}
              {!aiLoading && aiError && (
                <div className="border-[3px] border-neoBorder bg-neoPink px-4 py-3 text-sm font-black uppercase text-white">
                  {aiError}
                </div>
              )}

              {/* Results */}
              {!aiLoading && suggestions && (
                <>
                  {/* Caption suggestions */}
                  <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">
                      Tap a caption to use it
                    </p>
                    <div className="space-y-3">
                      {suggestions.captions.map((caption, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { applyCaption(caption); setAiOpen(false); }}
                          className="w-full border-[3px] border-neoBorder bg-neoSurface p-4 text-left text-sm font-bold leading-relaxed text-neoText shadow-neo-sm transition-colors hover:bg-neoSurfaceMuted active:bg-neoCyan"
                        >
                          {caption}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hashtag suggestions */}
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">
                      <Hash className="h-3 w-3 stroke-[3px]" />
                      Tap hashtags to add them
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.hashtags.map((tag, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => applyHashtag(tag)}
                          className="border-[3px] border-neoBorder bg-neoSurfaceMuted px-3 py-2 text-xs font-black uppercase shadow-neo-sm transition-colors hover:bg-neoCyan active:bg-neoYellow"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hint */}
                  <p className="text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-neoMuted">
                    Powered by Gemini 2.0 Flash · free tier
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <DraftsModal onRestore={handleRestoreDraft} />
    </>
  );
}
