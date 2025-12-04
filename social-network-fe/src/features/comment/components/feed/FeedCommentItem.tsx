'use-client';
import { timeAgo } from '@/lib/utils/time';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { CommentReactionButton } from '@/components/wrappers/CommentReaction';
import { CommentWithMyReaction } from '@/features/comment/types/comment';
import ContainedMedia from '@/features/media/components/common/ContainedMedia';
import { UserAvatar } from '@/components/ui/user-avatar';
export type FeedCommentItemProps = {
  comment: CommentWithMyReaction;
};
export default function FeedCommentItem({ comment }: FeedCommentItemProps) {
  const contentHtml = comment.content
    ? generateHTML(comment.content, [StarterKit, Emoji])
    : '';
  return (
    <div className="flex gap-3">
      <UserAvatar name={comment.author.firstName} src={comment.author.avatar} />

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
        {comment.media?.mediaId && (
          <ContainedMedia
            height={comment?.media?.height || 200}
            width={comment?.media?.width || 200}
            mediaType={comment.media.mediaType}
            url={comment.media.url}
            className="max-h-20 w-auto rounded-sm"
          />
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 px-3 py-1">
          <span>{timeAgo(comment.createdAt)}</span>
          <CommentReactionButton
            comment={comment}
            iconSize={18}
            btnClassName="px-2 py-1"
          />
          {(comment.repliesCount ?? 0) > 0 && (
            <span className="font-semibold hover:underline">
              {comment.repliesCount} phản hồi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
