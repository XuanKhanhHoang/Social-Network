'use-client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils/time';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { CommentReactionButton } from '@/components/wrappers/CommentReaction';
import { useGetCommentReplies } from '@/hooks/comment/useComment';
import {
  CommentWithMyReaction,
  transformToCommentWithMyReaction,
} from '@/lib/interfaces/comment';
import { useReplyStore } from '@/store/reply-comments/reply.store';
import ContainedMedia from '../../media/common/ContainedMedia';
import { UserAvatar } from '@/components/ui/user-avatar';

type CommentItemProps = {
  comment: CommentWithMyReaction;
  postId: string;
  level?: number;
  rootId: string;
};

export default function CommentItem({
  comment,
  postId,
  level = 0,
  rootId,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const setReplyingTo = useReplyStore((state) => state.setReplyingTo);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCommentReplies(comment.id, 5, { enabled: showReplies });

  const replies =
    data?.pages
      .flatMap((page) => page.data)
      .map((rp) => transformToCommentWithMyReaction(rp)) ?? [];

  const contentHtml = comment.content
    ? generateHTML(comment.content, [StarterKit, Emoji])
    : '';

  const indentationStyle = level > 0 ? { paddingLeft: '48px' } : {};

  return (
    <div className="flex gap-3 mb-0">
      <div style={indentationStyle}>
        <UserAvatar
          name={comment.author.firstName}
          src={comment.author.avatar}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 rounded-lg px-3 py-2 ">
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
        {comment.media && (
          <ContainedMedia
            height={comment.media.height || 200}
            mediaType={comment.media.mediaType}
            url={comment.media.url}
            width={comment.media.width || 200}
          />
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 px-3 py-1">
          <span>{timeAgo(comment.createdAt)}</span>
          <CommentReactionButton
            comment={comment}
            iconSize={18}
            btnClassName="px-2 py-1"
          />
          <button
            className="font-semibold hover:underline"
            onClick={() => setReplyingTo({ comment, rootId })}
          >
            Trả lời
          </button>
        </div>

        {(comment.repliesCount ?? 0) > 0 && !showReplies && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReplies(true)}
            className="!p-0 !h-auto !font-semibold !text-gray-500 !hover:bg-transparent !hover:text-gray-500 flex items-center gap-4"
          >
            <span className="block w-6 border-t border-gray-500"></span>
            <span>{`Xem phản hồi (${comment.repliesCount})`}</span>
          </Button>
        )}

        {showReplies && (
          <div className="space-y-3 mt-2">
            {isLoading && <p className="text-sm text-gray-500">Loading ...</p>}

            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                level={1}
                rootId={rootId}
              />
            ))}

            {hasNextPage && (
              <Button
                variant="link"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="p-0 h-auto font-semibold"
              >
                {isFetchingNextPage ? 'Loading...' : 'View more replies'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(false)}
              className="!p-0 !h-auto !font-semibold !text-gray-500 !hover:bg-transparent !hover:text-gray-500 flex items-center gap-4" // <-- Đã thêm !
            >
              <span className="block w-6 border-t border-gray-500"></span>
              <span>Ẩn các phản hồi</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
