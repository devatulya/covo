import React from 'react';
import { Bell, Globe, School } from 'lucide-react';
import { PostCard } from '../components/feed/PostCard';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { useUiStore } from '../store/uiStore';

const TABS = [
  { id: 'GLOBAL',  label: 'Global Feed',  icon: Globe,  accent: 'bg-neoYellow' },
  { id: 'COLLEGE', label: 'College Feed', icon: School, accent: 'bg-neoCyan' },
];

export function Feed() {
  const user = useAuthStore((state) => state.user);
  const {
    globalPosts, globalLoading, globalHasMore, fetchGlobalPosts, appendGlobalPosts,
    collegePosts, collegeLoading, collegeHasMore, fetchCollegePosts, appendCollegePosts,
  } = useFeedStore();
  const { activeTab, setActiveTab, openNotifications, unreadCount } = useUiStore((state) => ({
    activeTab:         state.activeTab,
    setActiveTab:      state.setActiveTab,
    openNotifications: state.openNotifications,
    unreadCount:       state.notifications.filter((n) => !n.read).length,
  }));

  // Kick off both feeds on mount so switching tabs feels instant
  React.useEffect(() => { fetchGlobalPosts();  }, [fetchGlobalPosts]);
  React.useEffect(() => { fetchCollegePosts(); }, [fetchCollegePosts]);

  // Infinite scroll sentinels
  const globalSentinelRef  = useInfiniteScroll(globalLoading,  globalHasMore,  appendGlobalPosts);
  const collegeSentinelRef = useInfiniteScroll(collegeLoading, collegeHasMore, appendCollegePosts);

  const isGlobal = activeTab !== 'COLLEGE';

  return (
    <div className="flex min-h-screen flex-col bg-neoBg pb-20">

      {/* ── Top header ── */}
      <div className="surface-panel sticky top-0 z-40 border-b-[3px] border-neoBorder px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">Students only</p>
            <h1 className="text-xl font-black tracking-tight">COVO</h1>
          </div>

          <button
            type="button"
            onClick={openNotifications}
            className="relative flex h-11 w-11 items-center justify-center border-[3px] border-neoBorder bg-neoCyan shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Bell className="h-5 w-5 stroke-[3px] text-neoText" />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center border-[3px] border-neoBorder bg-neoPink px-1 text-[10px] font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="surface-panel sticky top-[73px] z-30 border-b-[3px] border-neoBorder p-2">
        <div className="flex h-11 w-full items-center overflow-hidden border-[3px] border-neoBorder shadow-neo-sm">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const active = isGlobal ? tab.id === 'GLOBAL' : tab.id === 'COLLEGE';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-full flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 text-[10px] font-black uppercase tracking-[0.12em] transition-colors sm:text-xs ${
                  i !== TABS.length - 1 ? 'border-r-[3px] border-neoBorder' : ''
                } ${active ? `${tab.accent} text-neoText` : 'surface-panel text-neoMuted hover:bg-neoSurfaceMuted'}`}
              >
                <Icon className="h-3.5 w-3.5 stroke-[3px]" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Global Feed ── */}
      {isGlobal && (
        <FeedSection
          eyebrow="Global Feed"
          title="What students everywhere are saying"
          copy="Posts from every college on COVO — unfiltered, cross-campus, and always moving."
          accent="bg-neoYellow"
          icon={<Globe className="h-5 w-5 stroke-[3px]" />}
          posts={globalPosts}
          loading={globalLoading}
          sentinelRef={globalSentinelRef}
          emptyMessage="No posts yet. Be the first!"
        />
      )}

      {/* ── College Feed ── */}
      {!isGlobal && (
        <FeedSection
          eyebrow={user?.college ?? 'Your college'}
          title="What your campus is talking about"
          copy={`Posts from communities and sub-communities inside ${user?.college ?? 'your college'}.`}
          accent="bg-neoCyan"
          icon={<School className="h-5 w-5 stroke-[3px]" />}
          posts={collegePosts}
          loading={collegeLoading}
          sentinelRef={collegeSentinelRef}
          emptyMessage={
            user?.college
              ? `No posts from ${user.college} yet.`
              : 'Set your college in your profile to see posts here.'
          }
        />
      )}
    </div>
  );
}

// ─── Reusable feed section component ─────────────────────────────────────────
function FeedSection({ eyebrow, title, copy, accent, icon, posts, loading, sentinelRef, emptyMessage }) {
  return (
    <section className="px-4 py-5 md:px-6">

      {/* Section hero card */}
      <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{eyebrow}</p>
            <h2 className="text-2xl font-black uppercase leading-none sm:text-3xl">{title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-neoMuted">{copy}</p>
          </div>
          <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center border-[3px] border-neoBorder ${accent} shadow-neo-sm`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-5 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <p className="mt-10 text-center text-sm font-black uppercase text-neoMuted">{emptyMessage}</p>
      )}

      {/* Infinite scroll sentinel (invisible, triggers appendPosts) */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading skeletons */}
      {loading && (
        <div className="mt-4 space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 animate-pulse border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm" />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Infinite scroll hook ─────────────────────────────────────────────────────
function useInfiniteScroll(loading, hasMore, onLoadMore) {
  const sentinelRef = React.useRef(null);
  const observerRef = React.useRef(null);

  React.useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    });

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, onLoadMore]);

  return sentinelRef;
}
