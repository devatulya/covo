import { create } from 'zustand';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  startAfter,
  where,
  doc, 
  setDoc, 
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from './authStore';

const PAGE_SIZE = 10;

export const useFeedStore = create((set, get) => ({
  // ── Global feed ──────────────────────────────────────────────────────────
  globalPosts: [],
  globalLoading: false,
  globalHasMore: true,
  globalLastVisible: null,

  // ── College feed ─────────────────────────────────────────────────────────
  collegePosts: [],
  collegeLoading: false,
  collegeHasMore: true,
  collegeLastVisible: null,

  // ── Keep a flat posts[] alias so PostCard / toggleLike still work ─────────
  posts: [],
  loading: false,
  hasMore: true,
  lastVisible: null,

  // ── Global feed fetch ─────────────────────────────────────────────────────
  fetchGlobalPosts: async (force = false) => {
    if (get().globalLoading && !force) return;
    set({ globalLoading: true, loading: true });

    try {
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data(), isLiked: false }));
      const last = snap.docs[snap.docs.length - 1] ?? null;

      set({
        globalPosts: posts,
        posts,                         // keep alias in sync
        globalLoading: false,
        loading: false,
        globalHasMore: snap.docs.length === PAGE_SIZE,
        globalLastVisible: last,
      });
    } catch (err) {
      console.error('fetchGlobalPosts error:', err);
      set({ globalLoading: false, loading: false });
    }
  },

  appendGlobalPosts: async () => {
    const { globalLoading, globalHasMore, globalLastVisible } = get();
    if (globalLoading || !globalHasMore || !globalLastVisible) return;
    set({ globalLoading: true, loading: true });

    try {
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        startAfter(globalLastVisible),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const newPosts = snap.docs.map((d) => ({ id: d.id, ...d.data(), isLiked: false }));
      const last = snap.docs[snap.docs.length - 1] ?? null;

      set((state) => ({
        globalPosts: [...state.globalPosts, ...newPosts],
        posts: [...state.globalPosts, ...newPosts],
        globalLoading: false,
        loading: false,
        globalHasMore: snap.docs.length === PAGE_SIZE,
        globalLastVisible: last,
      }));
    } catch (err) {
      console.error('appendGlobalPosts error:', err);
      set({ globalLoading: false, loading: false });
    }
  },

  // ── College feed fetch ────────────────────────────────────────────────────
  fetchCollegePosts: async (force = false) => {
    const college = useAuthStore.getState().user?.college;
    if (!college) return;
    if (get().collegeLoading && !force) return;
    set({ collegeLoading: true });

    try {
      const q = query(
        collection(db, 'posts'),
        where('college', '==', college),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data(), isLiked: false }));
      const last = snap.docs[snap.docs.length - 1] ?? null;

      set({
        collegePosts: posts,
        collegeLoading: false,
        collegeHasMore: snap.docs.length === PAGE_SIZE,
        collegeLastVisible: last,
      });
    } catch (err) {
      console.error('fetchCollegePosts error:', err);
      set({ collegeLoading: false });
    }
  },

  appendCollegePosts: async () => {
    const college = useAuthStore.getState().user?.college;
    const { collegeLoading, collegeHasMore, collegeLastVisible } = get();
    if (!college || collegeLoading || !collegeHasMore || !collegeLastVisible) return;
    set({ collegeLoading: true });

    try {
      const q = query(
        collection(db, 'posts'),
        where('college', '==', college),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        startAfter(collegeLastVisible),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const newPosts = snap.docs.map((d) => ({ id: d.id, ...d.data(), isLiked: false }));
      const last = snap.docs[snap.docs.length - 1] ?? null;

      set((state) => ({
        collegePosts: [...state.collegePosts, ...newPosts],
        collegeLoading: false,
        collegeHasMore: snap.docs.length === PAGE_SIZE,
        collegeLastVisible: last,
      }));
    } catch (err) {
      console.error('appendCollegePosts error:', err);
      set({ collegeLoading: false });
    }
  },

  // ── Legacy aliases (kept so nothing else breaks) ──────────────────────────
  fetchPosts: async (force = false) => get().fetchGlobalPosts(force),
  appendPosts: async () => get().appendGlobalPosts(),

  // ── Like toggle (works across both feeds) ─────────────────────────────────
  toggleLike: async (postId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const toggle = (list) =>
      list.map((p) =>
        p.id !== postId
          ? p
          : { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1 },
      );

    set((state) => ({
      globalPosts:  toggle(state.globalPosts),
      collegePosts: toggle(state.collegePosts),
      posts:        toggle(state.posts),
    }));

    try {
      const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
      const post = [...get().globalPosts, ...get().collegePosts].find((p) => p.id === postId);
      if (post?.isLiked) {
        await setDoc(likeRef, { userId: user.uid, createdAt: new Date().toISOString() });
      } else {
        await deleteDoc(likeRef);
      }
    } catch (err) {
      console.error('toggleLike error:', err);
      // Revert
      set((state) => ({
        globalPosts:  toggle(state.globalPosts),
        collegePosts: toggle(state.collegePosts),
        posts:        toggle(state.posts),
      }));
    }
  },
}));
