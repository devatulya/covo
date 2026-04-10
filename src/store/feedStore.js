import { create } from 'zustand';

export const useFeedStore = create((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  page: 1,

  fetchPosts: async (force = false) => {
    if (get().loading && !force) {
      return;
    }

    set({ loading: true });

    setTimeout(() => {
      const dummyPosts = generateDummyPosts(1, 6);
      set({
        posts: dummyPosts,
        loading: false,
        hasMore: true,
        page: 1,
      });
    }, 500);
  },

  appendPosts: async () => {
    if (get().loading || !get().hasMore) {
      return;
    }

    set({ loading: true });

    setTimeout(() => {
      const nextPage = get().page + 1;
      const newPosts = generateDummyPosts(nextPage, 3);

      set((state) => ({
        posts: [...state.posts, ...newPosts],
        loading: false,
        page: nextPage,
        hasMore: nextPage < 4,
      }));
    }, 500);
  },

  toggleLike: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1,
        };
      }),
    })),
}));

const sampleContent = [
  'Someone turned the library silent floor into a full strategy meeting and honestly it was kind of inspiring.',
  'If the campus cafe keeps dropping surprise dessert nights, attendance is going to skyrocket for all the wrong reasons.',
  'Need the Design Dungeon to stop posting concepts that make every other club poster look asleep.',
  'The robotics lab is glowing again, which means either greatness or total disaster is about to happen.',
  'Whoever started the rooftop movie whisper campaign, please keep going.',
  'The best part of student life is how every serious meeting somehow becomes a meme thread by midnight.',
];

function generateDummyPosts(page, count) {
  return Array.from({ length: count }).map((_, index) => {
    const id = `post_${page}_${index}`;
    const contentIndex = (page + index) % sampleContent.length;
    const isAnonymous = Math.random() > 0.72;

    return {
      id,
      author: isAnonymous
        ? null
        : {
            id: index % 2 === 0 ? 'user_2' : 'user_1',
            name: index % 2 === 0 ? 'Jane Doe' : 'Atulya',
            username: index % 2 === 0 ? 'janedoe' : 'devatulya',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${page}_${index}`,
          },
      isAnonymous,
      originalAuthorId: index % 2 === 0 ? 'user_2' : 'user_1',
      content: sampleContent[contentIndex],
      image: Math.random() > 0.55 ? `https://picsum.photos/seed/${id}/900/640` : null,
      likes: Math.floor(Math.random() * 120) + 5,
      comments: Math.floor(Math.random() * 24) + 1,
      isLiked: false,
      createdAt: new Date(Date.now() - Math.random() * 10000000).toISOString(),
    };
  });
}
