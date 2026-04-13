import { create } from 'zustand';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter, 
  doc, 
  setDoc, 
  deleteDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from './authStore';

export const useFeedStore = create((set, get) => ({
  posts: [],
  loading: false,
  hasMore: true,
  lastVisible: null,

  fetchPosts: async (force = false) => {
    if (get().loading && !force) return;

    set({ loading: true });

    try {
      const postsRef = collection(db, 'posts');
      // Only fetch posts that are approved (or pending if we want users to see them, but typically active feed is approved)
      // Usually, feed queries should filter by status == "approved".
      // Wait, let's just fetch all ordered by createdAt for now.
      const q = query(postsRef, orderBy('createdAt', 'desc'), limit(10));
      
      const querySnapshot = await getDocs(q);
      const posts = [];
      
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data(), isLiked: false }); // We'll assume not liked initially, or fetch likes separately
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      set({
        posts,
        loading: false,
        hasMore: querySnapshot.docs.length === 10,
        lastVisible
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ loading: false });
    }
  },

  appendPosts: async () => {
    if (get().loading || !get().hasMore) return;

    const { lastVisible } = get();
    if (!lastVisible) return;

    set({ loading: true });

    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));
      
      const querySnapshot = await getDocs(q);
      const newPosts = [];
      
      querySnapshot.forEach((doc) => {
        newPosts.push({ id: doc.id, ...doc.data(), isLiked: false });
      });

      const nextLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      set((state) => ({
        posts: [...state.posts, ...newPosts],
        loading: false,
        hasMore: querySnapshot.docs.length === 10,
        lastVisible: nextLastVisible
      }));
    } catch (error) {
      console.error('Error appending posts:', error);
      set({ loading: false });
    }
  },

  toggleLike: async (postId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const postIndex = get().posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = get().posts[postIndex];
    const isLiked = post.isLiked;

    // Optimistic UI update
    set((state) => {
      const newPosts = [...state.posts];
      newPosts[postIndex] = {
        ...post,
        isLiked: !isLiked,
        likesCount: isLiked ? Math.max(0, post.likesCount - 1) : (post.likesCount || 0) + 1
      };
      return { posts: newPosts };
    });

    try {
      const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
      if (isLiked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on failure
      set((state) => {
        const newPosts = [...state.posts];
        const currentPost = newPosts.find(p => p.id === postId);
        if (currentPost) {
          currentPost.isLiked = isLiked;
          currentPost.likesCount = isLiked ? (currentPost.likesCount + 1) : (currentPost.likesCount - 1);
        }
        return { posts: newPosts };
      });
    }
  },
}));
