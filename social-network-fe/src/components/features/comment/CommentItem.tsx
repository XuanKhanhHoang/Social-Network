'use-client';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils/time';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import CommentEditor from './CommentEditor';
import { useStore } from '@/store';
import { CommentReactionButton } from '@/components/wrappers/CommentReaction';
import { useGetCommentReplies } from '@/hooks/comment/useComment';
import {
  CommentWithMyReaction,
  transformToCommentWithMyReaction,
} from '@/lib/interfaces/comment';

type CommentItemProps = {
  comment: CommentWithMyReaction;
  postId: string;
  level?: number;
};

export default function CommentItem({
  comment,
  postId,
  level = 0,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const user = useStore((s) => s.user);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCommentReplies(comment.id, 5, { enabled: showReplies });

  const replies =
    data?.pages
      .flatMap((page) => page.data)
      .map((rp) => transformToCommentWithMyReaction(rp)) ?? [];

  const contentHtml = comment.content
    ? generateHTML(comment.content, [StarterKit, Emoji])
    : '';

  const indentationStyle = { paddingLeft: `${level * 48}px` };

  return (
    <div className="flex gap-3" style={indentationStyle}>
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
          <button
            className="font-semibold hover:underline"
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </button>
        </div>

        {isReplying && (
          <div className="mt-2 flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>
                {user?.firstName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CommentEditor
                postId={postId}
                parentId={comment.id}
                placeholder={`Replying to ${comment.author.firstName}...`}
                onSuccess={() => setIsReplying(false)}
                autoFocus={true}
                variant="boxed"
              />
            </div>
          </div>
        )}

        {(comment.repliesCount ?? 0) > 0 && !showReplies && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowReplies(true)}
            className="p-0 h-auto font-semibold"
          >
            View {comment.repliesCount} replies
          </Button>
        )}

        {showReplies && (
          <div className="space-y-3 mt-2">
            {isLoading && (
              <p className="text-sm text-gray-500">Loading replies...</p>
            )}

            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                level={level + 1}
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
              variant="link"
              size="sm"
              onClick={() => setShowReplies(false)}
              className="p-0 h-auto font-semibold text-gray-500"
            >
              Hide replies
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
