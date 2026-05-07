import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { apiFetch } from '../utils/api';

const currentUserId = () => {
  const user = useAuthStore.getState().user;
  return user?.uid || user?.id || user?.userId || '';
};

const removePostFromList = (list, postId) => list.filter((post) => post.id !== postId);

const updatePostInList = (list, postId, patch) =>
  list.map((post) => (post.id === postId ? { ...post, ...patch } : post));

const bumpCommentCount = (list, postId, delta) =>
  list.map((post) =>
    post.id === postId
      ? { ...post, commentsCount: Math.max(0, (post.commentsCount || 0) + delta) }
      : post,
  );

export const useFeedStore = create((set, get) => ({
  globalPosts: [],
  globalLoading: false,
  globalHasMore: false,
  globalLastVisible: null,

  collegePosts: [],
  collegeLoading: false,
  collegeHasMore: false,
  collegeLastVisible: null,

  posts: [],
  loading: false,
  hasMore: false,
  lastVisible: null,

  commentsByPost: {},
  commentsLoadingByPost: {},
  commentSubmittingByPost: {},
  deletingPostById: {},
  deletingCommentById: {},

  fetchGlobalPosts: async (force = false) => {
    if (get().globalLoading && !force) return;
    set({ globalLoading: true, loading: true });

    try {
      const params = new URLSearchParams({ feed: 'global', userId: currentUserId() });
      const { posts } = await apiFetch(`/feed?${params.toString()}`);

      set({
        globalPosts: posts,
        posts,
        globalLoading: false,
        loading: false,
        globalHasMore: false,
        globalLastVisible: null,
      });
    } catch (err) {
      console.error('fetchGlobalPosts error:', err);
      set({ globalLoading: false, loading: false });
    }
  },

  appendGlobalPosts: async () => {},

  fetchCollegePosts: async (force = false) => {
    const college = useAuthStore.getState().user?.college || '';
    if (!college.trim()) {
      set({
        collegePosts: [],
        collegeLoading: false,
        collegeHasMore: false,
        collegeLastVisible: null,
      });
      return;
    }

    if (get().collegeLoading && !force) return;
    set({ collegeLoading: true });

    try {
      const params = new URLSearchParams({
        feed: 'college',
        userId: currentUserId(),
        college,
      });
      const { posts } = await apiFetch(`/feed?${params.toString()}`);

      set({
        collegePosts: posts,
        collegeLoading: false,
        collegeHasMore: false,
        collegeLastVisible: null,
      });
    } catch (err) {
      console.error('fetchCollegePosts error:', err);
      set({ collegeLoading: false });
    }
  },

  appendCollegePosts: async () => {},

  fetchPosts: async (force = false) => get().fetchGlobalPosts(force),
  appendPosts: async () => get().appendGlobalPosts(),

  deletePost: async (postId) => {
    const userId = currentUserId();
    if (!postId || !userId) return false;

    const previousState = {
      globalPosts: get().globalPosts,
      collegePosts: get().collegePosts,
      posts: get().posts,
      commentsByPost: get().commentsByPost,
    };

    set((state) => ({
      globalPosts: removePostFromList(state.globalPosts, postId),
      collegePosts: removePostFromList(state.collegePosts, postId),
      posts: removePostFromList(state.posts, postId),
      commentsByPost: Object.fromEntries(
        Object.entries(state.commentsByPost).filter(([key]) => key !== postId),
      ),
      deletingPostById: { ...state.deletingPostById, [postId]: true },
    }));

    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      set((state) => ({
        deletingPostById: { ...state.deletingPostById, [postId]: false },
      }));
      return true;
    } catch (err) {
      console.error('deletePost error:', err);
      set((state) => ({
        ...previousState,
        deletingPostById: { ...state.deletingPostById, [postId]: false },
      }));
      return false;
    }
  },

  fetchComments: async (postId, force = false) => {
    if (!postId) return;
    if (get().commentsLoadingByPost[postId] && !force) return;
    if (get().commentsByPost[postId] && !force) return;

    set((state) => ({
      commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: true },
    }));

    try {
      const { comments } = await apiFetch(`/posts/${postId}/comments`);
      set((state) => ({
        commentsByPost: { ...state.commentsByPost, [postId]: comments },
        commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: false },
      }));
    } catch (err) {
      console.error('fetchComments error:', err);
      set((state) => ({
        commentsLoadingByPost: { ...state.commentsLoadingByPost, [postId]: false },
      }));
    }
  },

  addComment: async (postId, text) => {
    const user = useAuthStore.getState().user;
    const userId = currentUserId();
    const trimmed = text.trim();
    if (!postId || !userId || !trimmed) return false;

    set((state) => ({
      commentSubmittingByPost: { ...state.commentSubmittingByPost, [postId]: true },
    }));

    const optimisticComment = {
      id: `local_${Date.now()}`,
      postId,
      userId,
      text: trimmed,
      authorName: user.username || user.name || 'Anonymous',
      authorAvatar: user.avatar || user.profilePic || '',
      createdAt: new Date().toISOString(),
      pending: true,
    };

    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: [...(state.commentsByPost[postId] || []), optimisticComment],
      },
      globalPosts: bumpCommentCount(state.globalPosts, postId, 1),
      collegePosts: bumpCommentCount(state.collegePosts, postId, 1),
      posts: bumpCommentCount(state.posts, postId, 1),
    }));

    try {
      const { comment, commentsCount } = await apiFetch(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          user: { ...user, uid: userId },
          text: trimmed,
        }),
      });

      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: (state.commentsByPost[postId] || []).map((item) =>
            item.id === optimisticComment.id ? { ...comment, pending: false } : item,
          ),
        },
        globalPosts: updatePostInList(state.globalPosts, postId, { commentsCount }),
        collegePosts: updatePostInList(state.collegePosts, postId, { commentsCount }),
        posts: updatePostInList(state.posts, postId, { commentsCount }),
        commentSubmittingByPost: { ...state.commentSubmittingByPost, [postId]: false },
      }));
      return true;
    } catch (err) {
      console.error('addComment error:', err);
      set((state) => ({
        commentsByPost: {
          ...state.commentsByPost,
          [postId]: (state.commentsByPost[postId] || []).filter((comment) => comment.id !== optimisticComment.id),
        },
        globalPosts: bumpCommentCount(state.globalPosts, postId, -1),
        collegePosts: bumpCommentCount(state.collegePosts, postId, -1),
        posts: bumpCommentCount(state.posts, postId, -1),
        commentSubmittingByPost: { ...state.commentSubmittingByPost, [postId]: false },
      }));
      return false;
    }
  },

  deleteComment: async (postId, commentId) => {
    const userId = currentUserId();
    if (!postId || !commentId || !userId) return false;

    const existingComments = get().commentsByPost[postId] || [];
    if (!existingComments.some((comment) => comment.id === commentId)) return false;

    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: existingComments.filter((comment) => comment.id !== commentId),
      },
      globalPosts: bumpCommentCount(state.globalPosts, postId, -1),
      collegePosts: bumpCommentCount(state.collegePosts, postId, -1),
      posts: bumpCommentCount(state.posts, postId, -1),
      deletingCommentById: { ...state.deletingCommentById, [commentId]: true },
    }));

    try {
      const { commentsCount } = await apiFetch(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
      set((state) => ({
        globalPosts: updatePostInList(state.globalPosts, postId, { commentsCount }),
        collegePosts: updatePostInList(state.collegePosts, postId, { commentsCount }),
        posts: updatePostInList(state.posts, postId, { commentsCount }),
        deletingCommentById: { ...state.deletingCommentById, [commentId]: false },
      }));
      return true;
    } catch (err) {
      console.error('deleteComment error:', err);
      set((state) => ({
        commentsByPost: { ...state.commentsByPost, [postId]: existingComments },
        globalPosts: bumpCommentCount(state.globalPosts, postId, 1),
        collegePosts: bumpCommentCount(state.collegePosts, postId, 1),
        posts: bumpCommentCount(state.posts, postId, 1),
        deletingCommentById: { ...state.deletingCommentById, [commentId]: false },
      }));
      return false;
    }
  },

  toggleLike: async (postId) => {
    const userId = currentUserId();
    if (!userId) return;

    const currentPost = [...get().globalPosts, ...get().collegePosts, ...get().posts].find((post) => post.id === postId);
    const nextLiked = !currentPost?.isLiked;

    const optimisticPatch = (post) => ({
      isLiked: nextLiked,
      likesCount: nextLiked ? (post.likesCount || 0) + 1 : Math.max(0, (post.likesCount || 0) - 1),
    });

    set((state) => ({
      globalPosts: state.globalPosts.map((post) => (post.id === postId ? { ...post, ...optimisticPatch(post) } : post)),
      collegePosts: state.collegePosts.map((post) => (post.id === postId ? { ...post, ...optimisticPatch(post) } : post)),
      posts: state.posts.map((post) => (post.id === postId ? { ...post, ...optimisticPatch(post) } : post)),
    }));

    try {
      const { likesCount, isLiked } = await apiFetch(`/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId, liked: nextLiked }),
      });

      set((state) => ({
        globalPosts: updatePostInList(state.globalPosts, postId, { likesCount, isLiked }),
        collegePosts: updatePostInList(state.collegePosts, postId, { likesCount, isLiked }),
        posts: updatePostInList(state.posts, postId, { likesCount, isLiked }),
      }));
    } catch (err) {
      console.error('toggleLike error:', err);
      set((state) => ({
        globalPosts: updatePostInList(state.globalPosts, postId, {
          isLiked: !nextLiked,
          likesCount: currentPost?.likesCount || 0,
        }),
        collegePosts: updatePostInList(state.collegePosts, postId, {
          isLiked: !nextLiked,
          likesCount: currentPost?.likesCount || 0,
        }),
        posts: updatePostInList(state.posts, postId, {
          isLiked: !nextLiked,
          likesCount: currentPost?.likesCount || 0,
        }),
      }));
    }
  },
}));
