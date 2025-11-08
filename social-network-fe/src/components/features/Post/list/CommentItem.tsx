'use-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { timeAgo } from '@/lib/utils/time';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { CommentReactionButton } from '@/components/wrappers/CommentReaction';
import { CommentWithMyReaction } from '@/lib/interfaces/comment';
export type FeedCommentItemProps = {
  comment: CommentWithMyReaction;
};
export default function FeedCommentItem({ comment }: FeedCommentItemProps) {
  const contentHtml = comment.content
    ? generateHTML(comment.content, [StarterKit, Emoji])
    : '';
  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback>
          {comment.author.firstName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <span className="font-semibold text-sm">
            {comment.author.firstName}
          </span>
          {contentHtml && (
            <div
              className="text-sm prose"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 px-3 py-1">
          <span>{timeAgo(comment.createdAt)}</span>
          <CommentReactionButton
            comment={comment}
            iconSize={18}
            btnClassName="px-2 py-1"
          />
          {(comment.repliesCount ?? 0) > 0 && (
            <span className="font-semibold hover:underline">5 phản hồi</span>
          )}
        </div>
      </div>
    </div>
  );
}
