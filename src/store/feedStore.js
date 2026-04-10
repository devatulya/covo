import { create } from 'zustand';

export const useFeedStore = create((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  page: 1,
  
  // Initialize or reset posts
  fetchPosts: async (force = false) => {
    if (get().loading && !force) return;
    set({ loading: true });
    
    // Simulate network request
    setTimeout(() => {
      const dummyPosts = generateDummyPosts(1, 5);
      set({ 
        posts: dummyPosts,
        loading: false, 
        hasMore: true,
        page: 1
      });
    }, 1000);
  },

  // Append posts for infinite scroll
  appendPosts: async () => {
    if (get().loading || !get().hasMore) return;
    set({ loading: true });
    
    setTimeout(() => {
      const nextPage = get().page + 1;
      const newPosts = generateDummyPosts(nextPage, 5);
      
      set((state) => ({
        posts: [...state.posts, ...newPosts],
        loading: false,
        page: nextPage,
        hasMore: nextPage < 5 // end at page 5 for demo
      }));
    }, 1000);
  },

  // Optimistic UI updates mapping precisely to user interactions
  toggleLike: (postId) => {
    set((state) => ({
      posts: state.posts.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    }));
  }
}));

// Helper to generate some dummy data for the feed
function generateDummyPosts(page, count) {
  return Array.from({ length: count }).map((_, i) => {
    const id = `post_${page}_${i}`;
    const isAnonymous = Math.random() > 0.7; // 30% chance anonymous
    return {
      id,
      author: isAnonymous ? null : {
        id: i % 2 === 0 ? 'user_2' : 'user_1', // some user_1 representing current
        name: i % 2 === 0 ? 'Jane Doe' : 'Atulya',
        username: i % 2 === 0 ? 'janedoe' : 'devatulya',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + page * 10}`
      },
      isAnonymous,
      // If anonymous, keep track of real author purely for tracking if it's (you)
      originalAuthorId: i % 2 === 0 ? 'user_2' : 'user_1',
      content: `This is a sample post content #${i} on page ${page}. Exploring Vite, Zustand and Tailwind! 🚀`,
      image: Math.random() > 0.5 ? `https://picsum.photos/seed/${id}/600/400` : null,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      isLiked: false,
      createdAt: new Date(Date.now() - Math.random() * 10000000).toISOString()
    };
  });
}
