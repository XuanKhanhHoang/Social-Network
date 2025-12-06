'use client';

import { memo } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { formatDisplayTime } from '@/lib/utils/time';
import { Post } from '@/features/post/types/post';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Emoji } from '@/lib/editor/emoji-node';
import PostFeedMedia from '@/features/media/components/feed/FeedMedia';
import { LockIcon } from 'lucide-react';

interface SharedPostCardProps {
  post: Post | undefined;
}

function SharedPostCard({ post }: SharedPostCardProps) {
  if (!post || post.isDeleted) {
    return (
      <div className="border border-gray-200 rounded-md p-4 bg-gray-100 flex items-center justify-center text-gray-500 mt-2 mx-3 mb-3">
        <LockIcon className="w-5 h-5 mr-2" />
        <span className="text-sm">Bài viết này hiện không khả dụng.</span>
      </div>
    );
  }

  const contentHtml = generateHTML(post.content, [
    StarterKit,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Emoji,
  ]);

  return (
    <div className="border border-gray-200 rounded-md mt-2 mx-3 mb-3 overflow-hidden">
      <div className="flex items-center p-3 bg-gray-50/50">
        <Link href={`/user/${post.author.username}`}>
          <UserAvatar
            name={post.author.firstName}
            src={post.author.avatar}
            className="w-8 h-8 me-2"
          />
        </Link>
        <div>
          <Link
            href={`/user/${post.author.username}`}
            className="font-semibold text-gray-900 text-sm hover:underline"
          >
            {post.author.lastName} {post.author.firstName}
          </Link>
          <div className="text-xs text-gray-500">
            {formatDisplayTime(post.createdAt)}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <ExpandableContent html={contentHtml} maxLines={3} />
      </div>

      {post.media && post.media.length > 0 && (
        <PostFeedMedia postId={post.id} media={post.media} />
      )}
    </div>
  );
}

export default memo(SharedPostCard);
