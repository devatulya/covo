import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const filters = ['All', 'Sports', 'Arts', 'Tech', 'Social'];

const communities = [
  { id: 'community_1', title: 'Engineering Club', desc: 'Build stuff, break stuff.', members: '1.2k', category: 'Tech', accent: 'bg-neoOrange' },
  { id: 'community_2', title: 'Chess Society', desc: 'Openings, gambits, and quiet chaos.', members: '450', category: 'Social', accent: 'bg-neoSurface' },
  { id: 'community_3', title: 'Graphic Design', desc: 'Pixels, posters, and late portfolio nights.', members: '890', category: 'Arts', accent: 'bg-neoPink' },
  { id: 'community_4', title: 'Varsity Football', desc: 'Game-day energy and practice talk.', members: '2.5k', category: 'Sports', accent: 'bg-neoYellow' },
  { id: 'community_5', title: 'Esports Arena', desc: 'Competitive queues and LAN night plans.', members: '1.7k', category: 'Tech', accent: 'bg-neoCyan' },
  { id: 'community_6', title: 'Weekend Warriors', desc: 'The plans you say yes to without thinking.', members: '620', category: 'Social', accent: 'bg-neoGreen' },
];

// ─── Fisheye drum-scroll (mobile only) ───────────────────────────────────────
// A fixed-height viewport acts as a lens: cards at the centre are full-size and
// sharp; cards drifting toward the edges shrink, blur, and fade out.
function FisheyeClubList({ communities, joinedCommunities, toggleJoin }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const [effects, setEffects] = useState({});

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerH = container.clientHeight;
    const centre = container.scrollTop + containerH / 2;

    const next = {};
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCentre = card.offsetTop + card.offsetHeight / 2;
      const dist = Math.abs(cardCentre - centre);
      // ratio: 0 at centre → 1 at half-container height away
      const ratio = Math.min(dist / (containerH * 0.48), 1);
      next[i] = {
        scale:   1 - ratio * 0.32,          // shrinks to ~68%
        blur:    ratio * 7,                  // blurs up to 7px
        opacity: 1 - ratio * 0.72,          // fades to ~28%
      };
    });
    setEffects(next);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Trim stale refs when filtered list changes length
    cardRefs.current = cardRefs.current.slice(0, communities.length);
    requestAnimationFrame(recalculate);

    container.addEventListener('scroll', recalculate, { passive: true });
    return () => container.removeEventListener('scroll', recalculate);
  }, [communities, recalculate]);

  return (
    // Outer wrapper clips the scrollable area and anchors the gradient overlays
    <div className="relative h-[54vh] overflow-hidden border-[3px] border-neoBorder shadow-neo">

      {/* ── Top fade-out gradient overlay ── */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-32"
        style={{ background: 'linear-gradient(to bottom, var(--neo-bg) 0%, transparent 100%)' }}
      />

      {/* ── Bottom fade-out gradient overlay ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32"
        style={{ background: 'linear-gradient(to top, var(--neo-bg) 0%, transparent 100%)' }}
      />

      {/* ── Centre focus line (subtle) ── */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-px -translate-y-1/2 bg-neoBorder opacity-20" />

      {/* ── Scrollable drum ── */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/*
          Top + bottom padding so that the first and last card can reach the
          centre of the viewport. Half the container height minus half an
          approximate card height (~52px).
        */}
        <div style={{ paddingTop: 'calc(27vh - 52px)', paddingBottom: 'calc(27vh - 52px)' }}>
          {communities.map((community, index) => {
            const joined = joinedCommunities.includes(community.id);
            const fx = effects[index] ?? { scale: 1, blur: 0, opacity: 1 };

            return (
              <article
                key={community.id}
                ref={(el) => { cardRefs.current[index] = el; }}
                style={{
                  scrollSnapAlign: 'center',
                  transformOrigin: 'center center',
                  transform:  `scale(${fx.scale})`,
                  filter:     `blur(${fx.blur}px)`,
                  opacity:    fx.opacity,
                  transition: 'transform 0.13s ease-out, filter 0.13s ease-out, opacity 0.13s ease-out',
                  willChange: 'transform, filter, opacity',
                }}
                className="surface-panel mx-3 mb-3 border-[3px] border-neoBorder p-4 shadow-neo"
              >
                <div className="flex items-center gap-3">
                  {/* Accent badge */}
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center border-[3px] border-neoBorder ${community.accent}`}>
                    <span className="text-xs font-black uppercase">{community.category.slice(0, 2)}</span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black uppercase leading-tight">{community.title}</h3>
                    <p className="mt-0.5 truncate text-xs font-semibold text-neoMuted">{community.desc}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-neoMuted">{community.members} members</p>
                  </div>

                  {/* Join toggle */}
                  <button
                    type="button"
                    onClick={() => toggleJoin(community.id)}
                    className={`flex-shrink-0 border-[3px] border-neoBorder px-3 py-2 text-[10px] font-black uppercase shadow-neo-sm ${
                      joined ? 'bg-neoCyan text-neoText' : 'bg-neoYellow text-neoText'
                    }`}
                  >
                    {joined ? '✓ In' : 'Join'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function Explore() {
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [joinedCommunities, setJoinedCommunities] = React.useState(['community_3']);

  const visibleCommunities = communities.filter((community) => {
    const filterMatches = activeFilter === 'All' || community.category === activeFilter;
    const searchMatches =
      !searchTerm ||
      community.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.desc.toLowerCase().includes(searchTerm.toLowerCase());

    return filterMatches && searchMatches;
  });

  const toggleJoin = (communityId) => {
    setJoinedCommunities((current) =>
      current.includes(communityId)
        ? current.filter((id) => id !== communityId)
        : [...current, communityId],
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-neoBg pb-20 md:pb-0">
      {/* ── Header ── */}
      <div className="surface-panel sticky top-0 z-30 border-b-[3px] border-neoBorder px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Find your people</p>
            <h1 className="text-xl font-black tracking-tight">Explore</h1>
          </div>
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center border-[3px] border-neoBorder bg-neoCyan shadow-neo-sm"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3px]" />
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8">
        {/* ── Search & filter panel ── */}
        <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
          <h2 className="text-3xl font-black uppercase leading-none sm:text-4xl">Choose your scene</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-neoMuted">
            Search what feels right, flip between categories, and join communities without leaving the page.
          </p>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px] text-neoText" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find clubs, majors, scenes..."
              className="h-16 w-full border-[3px] border-neoBorder bg-neoSurface pl-14 pr-4 text-base font-bold text-neoText shadow-neo outline-none placeholder:text-neoMuted"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`border-[3px] px-4 py-3 text-sm font-black uppercase shadow-neo-sm ${
                  activeFilter === filter
                    ? 'border-neoBorder bg-neoText text-neoBg'
                    : 'border-neoBorder bg-neoSurface text-neoText hover:bg-neoSurfaceMuted'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* ── Clubs list ── */}
        <section>
          {visibleCommunities.length === 0 ? (
            <p className="py-10 text-center text-sm font-black uppercase text-neoMuted">No communities found</p>
          ) : (
            <>
              {/* Mobile — fisheye drum scroll */}
              <div className="md:hidden">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted text-center">
                  Scroll to explore ↕
                </p>
                <FisheyeClubList
                  communities={visibleCommunities}
                  joinedCommunities={joinedCommunities}
                  toggleJoin={toggleJoin}
                />
              </div>

              {/* Desktop — regular grid */}
              <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleCommunities.map((community) => {
                  const joined = joinedCommunities.includes(community.id);
                  return (
                    <article key={community.id} className="surface-panel border-[3px] border-neoBorder p-4 shadow-neo">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center border-[3px] border-neoBorder ${community.accent}`}>
                        <span className="text-sm font-black uppercase">{community.category.slice(0, 2)}</span>
                      </div>
                      <h3 className="text-lg font-black uppercase leading-tight">{community.title}</h3>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-neoMuted">{community.desc}</p>
                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{community.members} members</p>
                      <button
                        type="button"
                        onClick={() => toggleJoin(community.id)}
                        className={`mt-5 w-full border-[3px] border-neoBorder py-3 text-xs font-black uppercase shadow-neo-sm ${
                          joined ? 'bg-neoCyan text-neoText' : 'bg-neoYellow text-neoText'
                        }`}
                      >
                        {joined ? 'Joined' : 'Join scene'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

