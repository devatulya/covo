import React from 'react';
import { ArrowRight, Bell, Flame, Users } from 'lucide-react';
import { PostCard } from '../components/feed/PostCard';
import { TopTabs } from '../components/navigation/TopTabs';
import { useAuthStore } from '../store/authStore';
import { useFeedStore } from '../store/feedStore';
import { useUiStore } from '../store/uiStore';

const tabOrder = ['COLLEGE', 'SUB-COMMUNITIES', 'MY FEED'];

const featuredBoards = [
  {
    id: 'board_1',
    title: 'Varsity Afterhours',
    copy: 'Locker-room drama, game-day chaos, and the loudest takes on campus.',
    accent: 'bg-neoYellow',
  },
  {
    id: 'board_2',
    title: 'Design Dungeon',
    copy: 'Post mockups, roast posters, and trade last-minute portfolio fixes.',
    accent: 'bg-neoPink',
  },
  {
    id: 'board_3',
    title: 'Weekend Warriors',
    copy: 'Spontaneous plans, road trips, and the people never staying in.',
    accent: 'bg-neoCyan',
  },
];

export function Feed() {
  const user = useAuthStore((state) => state.user);
  const { posts, loading, fetchPosts, appendPosts, hasMore } = useFeedStore((state) => ({
    posts: state.posts,
    loading: state.loading,
    fetchPosts: state.fetchPosts,
    appendPosts: state.appendPosts,
    hasMore: state.hasMore,
  }));
  const { openNotifications, unreadCount, setActiveTab } = useUiStore((state) => ({
    openNotifications: state.openNotifications,
    unreadCount: state.notifications.filter((notification) => !notification.read).length,
    setActiveTab: state.setActiveTab,
  }));

  const observerRef = React.useRef();
  const sectionRefs = React.useMemo(
    () => ({
      COLLEGE: React.createRef(),
      'SUB-COMMUNITIES': React.createRef(),
      'MY FEED': React.createRef(),
    }),
    [],
  );

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  React.useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)[0];

        if (mostVisible?.target?.dataset?.tab) {
          setActiveTab(mostVisible.target.dataset.tab);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.4, 0.7],
      },
    );

    tabOrder.forEach((tab) => {
      if (sectionRefs[tab].current) {
        sectionObserver.observe(sectionRefs[tab].current);
      }
    });

    return () => {
      sectionObserver.disconnect();
    };
  }, [sectionRefs, setActiveTab]);

  const lastPostElementRef = React.useCallback(
    (node) => {
      if (loading) {
        return;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          appendPosts();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, appendPosts],
  );

  const handleTabSelect = (tab) => {
    sectionRefs[tab]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const collegePosts = posts.slice(0, 2);
  const communityPosts = posts.slice(2, 4);
  const personalPosts = posts.slice(4);
  const personalFeed = personalPosts.length ? personalPosts : posts.slice(0, 2);

  return (
    <div className="flex min-h-screen flex-col bg-neoBg pb-20">
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

      <TopTabs onSelect={handleTabSelect} />

      <section ref={sectionRefs.COLLEGE} data-tab="COLLEGE" className="scroll-mt-32 px-4 py-5 md:px-6">
        <SectionHero
          eyebrow="College"
          title="What the whole campus is talking about"
          copy="Big updates, late-night rumors, and all the public chaos in one loud stream."
          accent="bg-neoYellow"
          icon={<Flame className="h-5 w-5 stroke-[3px]" />}
        />

        <div className="mt-5 space-y-4">
          {collegePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section ref={sectionRefs['SUB-COMMUNITIES']} data-tab="SUB-COMMUNITIES" className="scroll-mt-32 px-4 py-5 md:px-6">
        <SectionHero
          eyebrow="Sub-communities"
          title="Dive into the scenes that actually match your energy"
          copy="Every board has its own mess. Pick a corner of campus and get specific."
          accent="bg-neoCyan"
          icon={<Users className="h-5 w-5 stroke-[3px]" />}
        />

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {featuredBoards.map((board) => (
            <article key={board.id} className="surface-panel border-[3px] border-neoBorder p-4 shadow-neo-sm">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center border-[3px] border-neoBorder ${board.accent}`}>
                <ArrowRight className="h-5 w-5 stroke-[3px] text-neoText" />
              </div>
              <h3 className="mb-2 text-base font-black uppercase leading-tight">{board.title}</h3>
              <p className="text-sm font-semibold leading-relaxed text-neoMuted">{board.copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {communityPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section ref={sectionRefs['MY FEED']} data-tab="MY FEED" className="scroll-mt-32 px-4 py-5 md:px-6">
        <SectionHero
          eyebrow="My feed"
          title={`Built for ${user?.name ?? 'you'}`}
          copy="Your own circles, your own interests, and the people whose posts you actually want to see."
          accent="bg-neoPink"
          icon={<Bell className="h-5 w-5 stroke-[3px]" />}
        />

        <div className="mt-5 space-y-4">
          {personalFeed.map((post, index) => {
            const isLastPost = index === personalFeed.length - 1;

            if (isLastPost) {
              return (
                <div ref={lastPostElementRef} key={post.id}>
                  <PostCard post={post} />
                </div>
              );
            }

            return <PostCard key={post.id} post={post} />;
          })}
        </div>
      </section>

      {loading ? (
        <div className="space-y-4 px-4 pb-8 md:px-6">
          {[1, 2].map((item) => (
            <div key={item} className="h-40 border-[3px] border-neoBorder bg-neoSurface shadow-neo-sm" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionHero({ eyebrow, title, copy, accent, icon }) {
  return (
    <div className="surface-panel border-[3px] border-neoBorder p-5 shadow-neo">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neoMuted">{eyebrow}</p>
          <h2 className="text-2xl font-black uppercase leading-none sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-neoMuted">{copy}</p>
        </div>

        <div className={`flex h-16 w-16 items-center justify-center border-[3px] border-neoBorder ${accent} shadow-neo-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
