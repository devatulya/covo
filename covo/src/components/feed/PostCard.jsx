import React from 'react';
import { Heart, MessageSquare, Share2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';
import { Avatar } from '../ui/Avatar';

export function PostCard({ post }) {
  const user = useAuthStore((state) => state.user);
  const {
    toggleLike,
    fetchComments,
    addComment,
    deletePost,
    deleteComment,
    comments,
    commentsLoading,
    commentSubmitting,
    deletingPost,
    deletingCommentById,
  } = useFeedStore((state) => ({
    toggleLike: state.toggleLike,
    fetchComments: state.fetchComments,
    addComment: state.addComment,
    deletePost: state.deletePost,
    deleteComment: state.deleteComment,
    comments: state.commentsByPost[post.id] || [],
    commentsLoading: state.commentsLoadingByPost[post.id] || false,
    commentSubmitting: state.commentSubmittingByPost[post.id] || false,
    deletingPost: state.deletingPostById[post.id] || false,
    deletingCommentById: state.deletingCommentById,
  }));
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');

  const openComments = () => {
    setCommentsOpen((current) => {
      const next = !current;
      if (next) fetchComments(post.id);
      return next;
    });
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const ok = await addComment(post.id, commentText);
    if (ok) setCommentText('');
  };

  const handleDeletePost = async () => {
    const ok = window.confirm('Delete this post?');
    if (ok) await deletePost(post.id);
  };

  const handleDeleteComment = async (commentId) => {
    const ok = window.confirm('Delete this comment?');
    if (ok) await deleteComment(post.id, commentId);
  };

  let displayName = 'Anonymous';
  let displayAvatar = null;
  let isYou = false;

  const currentUserId = user?.uid || user?.id || user?.userId;

  if (post.isAnonymous) {
    isYou = currentUserId === post.userId;
  } else if (post.author) {
    // If you plan to denormalize author info on the post later
    displayName = `@${post.author.username}`;
    displayAvatar = post.author.avatar;
    isYou = currentUserId === post.userId;
  } else if (post.authorName) {
    displayName = `@${post.authorName}`;
    displayAvatar = post.authorAvatar || null;
    isYou = currentUserId === post.userId;
  } else {
    // fallback if no author object but we have userId
    isYou = currentUserId === post.userId;
    // placeholder if not anonymous but author object missing
    displayName = `@user_${post.userId?.slice(0, 4) || 'unknown'}`;
  }

  return (
    <article className="surface-panel overflow-hidden border-[3px] border-neoBorder shadow-neo">
      <div className="flex items-center justify-between border-b-[3px] border-neoBorder p-4">
        <div className="flex items-center gap-3">
          <Avatar src={displayAvatar} alt={displayName} className={post.isAnonymous ? 'bg-neoSurfaceMuted' : ''} />
          <div className="flex flex-col">
            <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
              {post.isAnonymous ? (
                displayName
              ) : (
                <Link to={`/profile/${post.userId}`} className="hover:text-neoPurple hover:underline">
                  {displayName}
                </Link>
              )}
              {isYou ? (
                <span className="border-[3px] border-neoBorder bg-neoYellow px-2 py-0.5 text-[10px] leading-none">You</span>
              ) : null}
            </span>
            <span className="mt-0.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">
              {post.isAnonymous ? 'Anonymous' : null}
              {post.college ? (
                <span className="inline-flex items-center gap-1 border-[2px] border-neoBorder bg-neoSurfaceMuted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em]">
                  🎓 {post.college}
                </span>
              ) : null}
            </span>
          </div>
        </div>

        {isYou ? (
          <button
            type="button"
            onClick={handleDeletePost}
            disabled={deletingPost}
            className="flex h-9 w-9 items-center justify-center border-[3px] border-neoBorder bg-red-500 text-white shadow-neo-sm disabled:cursor-not-allowed disabled:opacity-50"
            title="Delete post"
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4 stroke-[3px]" />
          </button>
        ) : null}
      </div>

      <div className="p-4 text-sm font-semibold leading-relaxed text-neoText">{post.content}</div>

      {(post.image || post.imageUrl) ? (
        <div className="relative aspect-video border-y-[3px] border-neoBorder bg-neoSurfaceMuted">
          <img
            src={`${post.image || post.imageUrl}?tr=w-720,q-70`}
            alt="Post"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      ) : null}

      <div className="flex items-center border-t-[3px] border-neoBorder divide-x-[3px] divide-neoBorder">
        <ActionButton active={post.isLiked} onClick={() => toggleLike(post.id)} icon={<Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />}>
          {post.likesCount || 0}
        </ActionButton>
        <ActionButton active={commentsOpen} onClick={openComments} icon={<MessageSquare className="h-5 w-5" />}>
          {post.commentsCount || 0}
        </ActionButton>
        <ActionButton icon={<Share2 className="h-5 w-5" />} />
      </div>

      {commentsOpen ? (
        <div className="border-t-[3px] border-neoBorder bg-neoSurfaceMuted p-4">
          <div className="space-y-3">
            {commentsLoading ? (
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neoMuted">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-[3px] border-neoBorder bg-neoSurface p-3 shadow-neo-sm">
                  <div className="flex gap-3">
                    <Avatar
                      src={comment.authorAvatar || null}
                      alt={comment.authorName || comment.username || 'Comment author'}
                      className="h-9 w-9 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-black uppercase tracking-wide">
                            <Link to={`/profile/${comment.userId}`} className="hover:text-neoPurple hover:underline">
                              @{comment.authorName || comment.username || `user_${comment.userId?.slice(0, 4) || 'unknown'}`}
                            </Link>
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {comment.pending ? (
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-neoMuted">Sending</span>
                          ) : null}
                          {comment.userId === currentUserId && !comment.pending ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentById[comment.id]}
                              className="flex h-7 w-7 items-center justify-center border-[2px] border-neoBorder bg-red-500 text-white disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete comment"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="h-3.5 w-3.5 stroke-[3px]" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <p className="break-words text-sm font-semibold leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neoMuted">No comments yet</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value.slice(0, 180))}
              placeholder="Add a comment..."
              className="min-w-0 flex-1 border-[3px] border-neoBorder bg-neoSurface px-3 py-2 text-sm font-bold outline-none placeholder:text-neoMuted"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commentSubmitting}
              className="shrink-0 border-[3px] border-neoBorder bg-neoYellow px-3 py-2 text-xs font-black uppercase shadow-neo-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {commentSubmitting ? '...' : 'Post'}
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

function ActionButton({ children, icon, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${
        active ? 'bg-neoSurfaceMuted text-neoPink' : 'hover:bg-neoSurfaceMuted'
      }`}
    >
      {icon}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
