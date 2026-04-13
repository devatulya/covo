import React from 'react';
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        </section>
      </div>
    </div>
  );
}
