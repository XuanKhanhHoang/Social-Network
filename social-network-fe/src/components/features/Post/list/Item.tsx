import { MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { memo } from 'react';
import PostMedia from './Media';
import { formatDisplayTime } from '@/lib/utils/time';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Emoji } from '@/lib/editor/emoji-node';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { PostReactionButton } from '@/components/wrappers/PostReaction';
import { PostWithTopComment } from '@/lib/interfaces/post';
import FeedCommentItem from './CommentItem';
import CommentEditor from '../../comment/editor/Editor';

export type PostItemProps = {
  post: PostWithTopComment;
};

function PostItem({ post }: PostItemProps) {
  const contentHtml = generateHTML(post.content, [
    StarterKit,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Emoji,
  ]);

  return (
    <div className="bg-white rounded-sm shadow-sm p-0 mb-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3 p-3">
        <div className="flex items-center">
          <Avatar className="w-12 h-12 border-2 border-white bg-gray-100 rounded-full flex-shrink-0 me-2">
            <div className="flex items-center justify-center w-full h-full relative">
              <AvatarImage src="" alt="" />
              <AvatarFallback className=" text-sm">
                {post.author.firstName.charAt(0)}
              </AvatarFallback>
            </div>
          </Avatar>

          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {post.author.firstName}
            </h3>
            <span className="text-gray-500 text-xs">
              {formatDisplayTime(post.createdAt)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:bg-gray-100 h-8 w-8"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-3 pb-3">
        <ExpandableContent html={contentHtml} maxLines={6} />
      </div>

      <div className="py-1"></div>

      {post.media && post.media.length > 0 && (
        <PostMedia postId={post.id} media={post.media} />
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
        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
          <Send className="w-5 h-5" />
          <span className="text-sm font-medium">{post.sharesCount}</span>
        </button>
      </div>

      {post.topComment && (
        <div className="my-2 p-3 ">
          {<FeedCommentItem comment={post.topComment} />}
        </div>
      )}

      <CommentEditor postId={post.id} className="py-1 px-3" />
    </div>
  );
}

export default memo(PostItem);
