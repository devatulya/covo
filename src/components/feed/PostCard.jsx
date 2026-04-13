import React from 'react';
import { Heart, MessageSquare, MoreHorizontal, Share2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';
import { Avatar } from '../ui/Avatar';

export function PostCard({ post }) {
  const user = useAuthStore((state) => state.user);
  const toggleLike = useFeedStore((state) => state.toggleLike);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  let displayName = 'Anonymous';
  let displayAvatar = null;
  let isYou = false;

  if (post.isAnonymous) {
    isYou = user?.uid === post.userId;
  } else if (post.author) {
    // If you plan to denormalize author info on the post later
    displayName = `@${post.author.username}`;
    displayAvatar = post.author.avatar;
    isYou = user?.uid === post.userId;
  } else {
    // fallback if no author object but we have userId
    isYou = user?.uid === post.userId;
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
              {displayName}
              {isYou ? (
                <span className="border-[3px] border-neoBorder bg-neoYellow px-2 py-0.5 text-[10px] leading-none">You</span>
              ) : null}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neoMuted">
              {post.isAnonymous ? '2h ago | Library' : '5h ago | Student Union'}
            </span>
          </div>
        </div>

        <button type="button" className="text-neoText">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 text-sm font-semibold leading-relaxed text-neoText">{post.content}</div>

      {post.image ? (
        <div className="relative aspect-video border-y-[3px] border-neoBorder bg-neoSurfaceMuted">
          <img
            src={post.image}
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
        <ActionButton icon={<MessageSquare className="h-5 w-5" />}>{post.commentsCount || 0}</ActionButton>
        <ActionButton icon={<Share2 className="h-5 w-5" />} />
      </div>
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
