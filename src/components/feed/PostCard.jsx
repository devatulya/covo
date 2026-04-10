import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';

export function PostCard({ post }) {
  const { user } = useAuthStore();
  const { toggleLike } = useFeedStore();
  const [imageLoaded, setImageLoaded] = useState(false);

  let displayName = 'Anonymous';
  let displayAvatar = null;
  let isYou = false;

  if (post.isAnonymous) {
    if (user?.id === post.originalAuthorId) {
      displayName = 'Anonymous';
      isYou = true;
    }
  } else if (post.author) {
    displayName = `@${post.author.username}`;
    displayAvatar = post.author.avatar;
    if (user?.id === post.author.id) {
      isYou = true;
    }
  }

  return (
    <article className="bg-white border-[3px] border-neoBorder mx-4 my-4 shadow-neo flex flex-col relative transition-transform">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b-[3px] border-neoBorder">
        <div className="flex items-center gap-3">
          <Avatar 
            src={displayAvatar} 
            alt={displayName} 
            className={`rounded-full ${(post.isAnonymous) ? 'bg-slate-800' : ''}`} 
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-neoText flex items-center gap-1 uppercase tracking-wide">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {post.isAnonymous ? '2 hrs ago • Library' : '5 hrs ago • Student Union'}
            </span>
          </div>
        </div>
        <button className="text-neoText focus:outline-none">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 text-sm font-semibold text-neoText leading-relaxed">
        {post.content}
      </div>

      {post.image && (
        <div className={`w-full border-t-[3px] border-neoBorder border-b-[3px] relative aspect-video bg-white transition-opacity duration-300`}>
          <img 
            src={post.image} 
            alt="Post"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center border-t-[3px] border-neoBorder divide-x-[3px] divide-neoBorder">
        <button 
          onClick={() => toggleLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-100 transition-colors font-bold ${post.isLiked ? 'text-neoPink' : 'text-neoText'}`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{post.likes}</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-slate-100 transition-colors text-neoText font-bold">
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm">{post.comments}</span>
        </button>

        <button className="flex-1 flex items-center justify-center py-3 hover:bg-slate-100 transition-colors text-neoText">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </article>
  );
}
