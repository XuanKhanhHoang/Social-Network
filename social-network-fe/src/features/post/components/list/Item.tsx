'use client';

import {
  MessageCircle,
  MoreHorizontal,
  Send,
  Pencil,
  Trash,
} from 'lucide-react';
import { memo } from 'react';
import { formatDisplayTime } from '@/lib/utils/time';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Emoji } from '@/lib/editor/emoji-node';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PostReactionButton } from '@/components/wrappers/PostReaction';
import { PostWithTopComment } from '@/features/post/types/post';
import CommentEditor from '@/features/comment/components/editor/CommentEditor';
import FeedCommentItem from '@/features/comment/components/feed/FeedCommentItem';
import PostFeedMedia from '@/features/media/components/feed/FeedMedia';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useStore } from '@/store';
import { usePostModalContext } from '../../contexts/PostModalContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { transformToPostInEditor } from '@/features/post/components/create/text-editor/type';
import SharedPostCard from './SharedPostCard';

export type PostItemProps = {
  post: PostWithTopComment;
};

function PostItem({ post }: PostItemProps) {
  const user = useStore((state) => state.user);
  const isAuthor = user?.id === post.author.id;
  const { openEdit, openShare } = usePostModalContext();

  const contentHtml = generateHTML(post.content, [
    StarterKit,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Emoji,
  ]);

  const handleEdit = () => {
    openEdit(transformToPostInEditor(post));
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      console.log('Delete post:', post.id);
      toast.info('Tính năng xóa đang phát triển');
    }
  };

  return (
    <div className="bg-white rounded-sm shadow-sm p-0 mb-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3 p-3">
        <div className="flex items-center">
          <Link href={`/user/${post.author.username}`}>
            <UserAvatar
              name={post.author.firstName}
              src={post.author.avatar}
              className="me-2"
            />
          </Link>

          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {post.author.firstName}
            </h3>
            <span className="text-gray-500 text-xs">
              {formatDisplayTime(post.createdAt)}
            </span>
          </div>
        </div>

        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:bg-gray-100 h-8 w-8"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa bài viết</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Xóa bài viết</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="px-3 pb-3">
        <ExpandableContent html={contentHtml} maxLines={6} />
      </div>

      <div className="py-1"></div>

      {!!post.parentPost && <SharedPostCard post={post.parentPost} />}

      {post.media && post.media.length > 0 && (
        <PostFeedMedia postId={post.id} media={post.media} />
      )}

      <div className="flex items-center space-x-6 text-gray-500 mt-0 py-1 border-t border-b border-gray-100">
        <PostReactionButton
          postId={post.id}
          showLabel={false}
          showCount={true}
          initialCount={post.reactionsCount}
          initialReaction={post.myReaction}
          btnClassName="px-2 py-1"
        />
        <Link
          href={`/post/${post.id}`}
          className="flex items-center space-x-2 hover:text-indigo-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </Link>
        <button
          onClick={() => openShare(post)}
          className="flex items-center space-x-2 hover:text-green-500 transition-colors"
        >
          <Send className="w-5 h-5" />
          <span className="text-sm font-medium">{post.sharesCount}</span>
        </button>
      </div>

      {post.topComment && (
        <div className="mt-2 pt-3 px-2">
          {<FeedCommentItem comment={post.topComment} />}
        </div>
      )}

      <CommentEditor postId={post.id} className="py-1 px-3" />
    </div>
  );
}

export default memo(PostItem);
