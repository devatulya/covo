import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuthStore } from '../store/authStore';

const filters = ['Communities', 'People', 'College'];

const communityDetails = {
  'Coding Club': { desc: 'Build projects, crack contests, and ship with your campus crew.', category: 'Communities', accent: 'bg-neoCyan', emoji: '💻' },
  'AI and Robotics Society': { desc: 'Models, bots, sensors, and late-night experiments.', category: 'Communities', accent: 'bg-neoYellow', emoji: '🤖' },
  'Cyber Security Cell': { desc: 'CTFs, threat hunting, and security-first thinking.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '🛡️' },
  'Google Developer Student Club': { desc: 'Developer events, workshops, and product builds.', category: 'Communities', accent: 'bg-neoCyan', emoji: '🚀' },
  'IEEE Student Branch': { desc: 'Technical talks, paper sessions, and engineering networks.', category: 'Communities', accent: 'bg-neoYellow', emoji: '⚡' },
  'Entrepreneurship Cell': { desc: 'Startup ideas, pitch nights, and founder energy.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '💡' },
  'Research and Innovation Club': { desc: 'Projects, prototypes, and curious problem solving.', category: 'Communities', accent: 'bg-neoCyan', emoji: '🔍' },
  'Training and Placement Cell': { desc: 'Placement prep, opportunities, and peer support.', category: 'Communities', accent: 'bg-neoYellow', emoji: '👔' },
  'Drama Club': { desc: 'Stage work, scripts, acting, and production chaos.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '🎭' },
  'Dance Club': { desc: 'Practice rooms, battles, and performance squads.', category: 'Communities', accent: 'bg-neoCyan', emoji: '💃' },
  'Music Club': { desc: 'Jams, vocals, instruments, and open mic nights.', category: 'Communities', accent: 'bg-neoYellow', emoji: '🎸' },
  'Fine Arts Club': { desc: 'Sketches, posters, murals, and visual culture.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '🎨' },
  'Literary Society': { desc: 'Writing, reading, poetry, and campus publications.', category: 'Communities', accent: 'bg-neoCyan', emoji: '📚' },
  'Debate Club': { desc: 'Arguments with structure, wit, and microphones.', category: 'Communities', accent: 'bg-neoYellow', emoji: '🗣️' },
  'Photography Club': { desc: 'Shoots, edits, reels, and visual storytelling.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '📸' },
  'Film and Media Club': { desc: 'Short films, edits, screenings, and campus media.', category: 'Communities', accent: 'bg-neoCyan', emoji: '🎬' },
  'College Magazine Team': { desc: 'Editorials, reports, layouts, and campus voice.', category: 'Communities', accent: 'bg-neoYellow', emoji: '📰' },
  'Football Club': { desc: 'Game-day plans, practice talk, and team updates.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '⚽' },
  'Cricket Club': { desc: 'Nets, fixtures, selection chatter, and match days.', category: 'Communities', accent: 'bg-neoCyan', emoji: '🏏' },
  'Basketball Club': { desc: 'Court sessions, squads, and tournament prep.', category: 'Communities', accent: 'bg-neoYellow', emoji: '🏀' },
  'Badminton Club': { desc: 'Rallies, ladders, and quick evening games.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '🏸' },
  'NSS Volunteers': { desc: 'Service work, drives, and social impact projects.', category: 'Communities', accent: 'bg-neoCyan', emoji: '🤝' },
  'Rotaract Club': { desc: 'Community service, leadership, and event work.', category: 'Communities', accent: 'bg-neoYellow', emoji: '🎡' },
  'Eco Club': { desc: 'Sustainability, cleanups, and green campus work.', category: 'Communities', accent: 'bg-neoPink text-white', emoji: '🌿' },
};

function FisheyeExploreList({ items, joinedCommunities, onToggleCommunity }) {
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
      const ratio = Math.min(dist / (containerH * 0.48), 1);
      next[i] = {
        scale: 1 - ratio * 0.32,
        blur: ratio * 7,
        opacity: 1 - ratio * 0.72,
      };
    });

    setEffects(next);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    cardRefs.current = cardRefs.current.slice(0, items.length);
    requestAnimationFrame(recalculate);

    container.addEventListener('scroll', recalculate, { passive: true });
    return () => container.removeEventListener('scroll', recalculate);
  }, [items, recalculate]);

  return (
    <div className="relative h-[54vh] overflow-hidden border-[3px] border-neoBorder shadow-neo">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-32"
        style={{ background: 'linear-gradient(to bottom, var(--neo-bg) 0%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32"
        style={{ background: 'linear-gradient(to top, var(--neo-bg) 0%, transparent 100%)' }}
      />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-px -translate-y-1/2 bg-neoBorder opacity-20" />

      <div ref={containerRef} className="h-full overflow-y-scroll" style={{ scrollSnapType: 'y mandatory' }}>
        <div style={{ paddingTop: 'calc(27vh - 52px)', paddingBottom: 'calc(27vh - 52px)' }}>
          {items.map((item, index) => {
            const fx = effects[index] ?? { scale: 1, blur: 0, opacity: 1 };
            return (
              <ExploreCard
                key={item.id}
                item={item}
                joinedCommunities={joinedCommunities}
                onToggleCommunity={onToggleCommunity}
                ref={(el) => { cardRefs.current[index] = el; }}
                style={{
                  scrollSnapAlign: 'center',
                  transformOrigin: 'center center',
                  transform: `scale(${fx.scale})`,
                  filter: `blur(${fx.blur}px)`,
                  opacity: fx.opacity,
                  transition: 'transform 0.13s ease-out, filter 0.13s ease-out, opacity 0.13s ease-out',
                  willChange: 'transform, filter, opacity',
                }}
                className="mx-3 mb-3"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ExploreCard = React.forwardRef(function ExploreCard(
  { item, joinedCommunities, onToggleCommunity, style, className = '' },
  ref,
) {
  const isCommunity = item.type === 'community';
  const joined = isCommunity && joinedCommunities.includes(item.title);

  return (
    <article 
      ref={ref} 
      style={style} 
      className={`surface-panel flex h-full min-h-[260px] flex-col border-[3px] border-neoBorder p-4 shadow-neo transition-transform hover:-translate-y-1 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border-[3px] border-neoBorder shadow-neo-sm ${item.accent}`}>
          {item.image ? (
            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl">{item.emoji || item.badge}</span>
          )}
        </div>

        <div className="min-w-0 flex-1" lang="en">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">{item.label}</p>
          <h3 
            className="mt-1 break-words text-[13px] font-black uppercase leading-[1.1] md:text-base"
            style={{ overflowWrap: 'anywhere', hyphens: 'auto' }}
          >
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-xs font-semibold leading-relaxed text-neoMuted">
            {item.desc}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        {isCommunity ? (
          <button
            type="button"
            onClick={() => onToggleCommunity(item.title)}
            className={`w-full border-[3px] border-neoBorder py-3 text-xs font-black uppercase shadow-neo-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              joined ? 'bg-neoCyan text-neoText' : 'bg-neoYellow text-neoText'
            }`}
          >
            {joined ? 'Joined' : 'Join This'}
          </button>
        ) : item.href ? (
          <Link
            to={item.href}
            className="block w-full border-[3px] border-neoBorder bg-neoYellow py-3 text-center text-xs font-black uppercase shadow-neo-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            View Profile
          </Link>
        ) : item.type === 'college' ? (
          <div className="w-full border-[3px] border-neoBorder bg-neoSurfaceMuted py-3 text-center text-[10px] font-black uppercase">
            Your Campus
          </div>
        ) : null}
      </div>
    </article>
  );
});

export function Explore() {
  const { user, updateProfile } = useAuthStore((state) => ({
    user: state.user,
    updateProfile: state.updateProfile,
  }));
  const [activeFilter, setActiveFilter] = React.useState('Communities');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [collegeUsers, setCollegeUsers] = React.useState([]);
  const [collegeCommunities, setCollegeCommunities] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const [joinError, setJoinError] = React.useState('');

  const joinedCommunities = React.useMemo(() => {
    const communities = Array.isArray(user?.communities) ? user.communities : [];
    const tribes = Array.isArray(user?.tribes) ? user.tribes : [];
    return [...new Set([...communities, ...tribes])];
  }, [user?.communities, user?.tribes]);

  useEffect(() => {
    let cancelled = false;

    async function loadExploreData() {
      if (!user?.college) return;

      setLoadingData(true);
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), where('college', '==', user.college)));
        let communitiesSnap = { docs: [] };

        try {
          communitiesSnap = await getDocs(
            query(collection(db, 'collegeCommunities'), where('college', '==', user.college), where('status', '==', 'approved')),
          );
        } catch (communityErr) {
          console.info('College community approvals are not available yet:', communityErr.message);
        }

        if (cancelled) return;

        setCollegeUsers(
          usersSnap.docs
            .map((userDoc) => ({ id: userDoc.id, uid: userDoc.id, ...userDoc.data() }))
            .filter((profile) => profile.uid !== user.uid),
        );
        setCollegeCommunities(
          communitiesSnap.docs.map((communityDoc) => ({
            id: communityDoc.id,
            ...communityDoc.data(),
          })),
        );
      } catch (err) {
        console.error('Error loading explore data:', err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    loadExploreData();

    return () => {
      cancelled = true;
    };
  }, [user?.college, user?.uid]);

  const availableCommunityNames = React.useMemo(() => {
    // Show ALL possible communities from our details list + any newly approved ones from DB
    const staticNames = Object.keys(communityDetails);
    const dbNames = collegeCommunities
      .map((community) => community.title || community.name)
      .filter(Boolean);

    return [...new Set([...staticNames, ...dbNames])];
  }, [collegeCommunities]);

  const items = React.useMemo(() => {
    const communityItems = availableCommunityNames.map((name) => {
      const approvedCommunity = collegeCommunities.find((community) => (community.title || community.name) === name);
      const details = communityDetails[name] || {};
      return {
        id: `community-${name}`,
        type: 'community',
        title: name,
        desc: approvedCommunity?.desc || approvedCommunity?.description || details.desc || `The ${name} hub for ${user?.college || 'your campus'}.`,
        label: 'Society',
        badge: 'CO',
        emoji: details.emoji || '👥',
        category: 'Communities',
        accent: approvedCommunity?.accent || details.accent || 'bg-neoCyan',
      };
    });

    const peopleItems = collegeUsers.map((profile) => ({
      id: `person-${profile.uid}`,
      type: 'person',
      title: profile.name || profile.username || 'COVO Student',
      desc: [profile.username ? `@${profile.username}` : null, profile.major, profile.college].filter(Boolean).join(' / '),
      label: 'Person',
      badge: 'PE',
      image: profile.avatar || profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`,
      category: 'People',
      accent: 'bg-neoYellow',
      href: `/profile/${profile.uid}`,
    }));

    const collegeItem = user?.college
      ? [{
          id: `college-${user.college}`,
          type: 'college',
          title: user.college,
          desc: 'Your verified campus space. All communities and students shown here are tied to this college.',
          label: 'College',
          badge: 'CL',
          emoji: '🏛️',
          category: 'College',
          accent: 'bg-neoPink text-white',
        }]
      : [];

    return [...communityItems, ...peopleItems, ...collegeItem];
  }, [availableCommunityNames, collegeCommunities, collegeUsers, user?.college]);

  const visibleItems = items.filter((item) => {
    const filterMatches = item.category === activeFilter;
    const lowerSearch = searchTerm.toLowerCase();
    const searchMatches =
      !lowerSearch ||
      item.title.toLowerCase().includes(lowerSearch) ||
      item.desc.toLowerCase().includes(lowerSearch) ||
      item.label.toLowerCase().includes(lowerSearch);

    return filterMatches && searchMatches;
  });

  const toggleCommunity = async (communityName) => {
    if (!user) return;
    setJoinError('');

    const nextCommunities = joinedCommunities.includes(communityName)
      ? joinedCommunities.filter((name) => name !== communityName)
      : [...joinedCommunities, communityName];

    try {
      await updateProfile({
        communities: nextCommunities,
        tribes: nextCommunities,
      });
    } catch (err) {
      console.error('Error updating community membership:', err);
      setJoinError('Could not update your communities. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neoBg pb-20 md:pb-0">
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
        <section className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
          <h2 className="text-3xl font-black uppercase leading-none sm:text-4xl">Explore your campus</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-neoMuted">
            Search people, your college, and communities available inside {user?.college || 'your verified college'}.
            New societies will show up here after college-level approval.
          </p>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px] text-neoText" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search people, college, communities..."
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

        {joinError ? (
          <div className="border-[3px] border-neoBorder bg-red-500 p-3 text-center text-xs font-black uppercase text-white shadow-neo">
            {joinError}
          </div>
        ) : null}

        <section>
          {loadingData ? (
            <p className="py-10 text-center text-sm font-black uppercase text-neoMuted">Loading explore data...</p>
          ) : visibleItems.length === 0 ? (
            <p className="py-10 text-center text-sm font-black uppercase text-neoMuted">No results found</p>
          ) : (
            <>
              <div className="md:hidden">
                <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">
                  Scroll to explore
                </p>
                <FisheyeExploreList
                  items={visibleItems}
                  joinedCommunities={joinedCommunities}
                  onToggleCommunity={toggleCommunity}
                />
              </div>

              <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                {visibleItems.map((item) => (
                  <ExploreCard
                    key={item.id}
                    item={item}
                    joinedCommunities={joinedCommunities}
                    onToggleCommunity={toggleCommunity}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
