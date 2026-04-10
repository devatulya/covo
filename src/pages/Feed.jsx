import React from 'react';
import { Bell } from 'lucide-react';
import { TopTabs } from '../components/navigation/TopTabs';
import { PostCard } from '../components/feed/PostCard';
import { useFeedStore } from '../store/feedStore';

export function Feed() {
  const { posts, loading, fetchPosts, appendPosts, hasMore } = useFeedStore();
  const observerRef = React.useRef();

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const lastPostElementRef = React.useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        appendPosts();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, appendPosts]);

  return (
    <div className="flex flex-col min-h-screen bg-neoBg pb-20">
      <div className="bg-white border-b-[3px] border-neoBorder px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-black tracking-tighter">COVO</h1>
        <button className="w-8 h-8 flex items-center justify-center border-[3px] border-neoBorder bg-neoCyan shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
          <Bell className="w-4 h-4 text-neoText stroke-[3px]" />
        </button>
      </div>

      <TopTabs />
      
      <div className="flex flex-col mt-2">
        {posts.map((post, index) => {
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post.id}>
                <PostCard post={post} />
              </div>
            );
          }
          return <PostCard key={post.id} post={post} />;
        })}
        
        {loading && (
          <div className="p-4 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-white border-[3px] border-slate-200 h-64"></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
