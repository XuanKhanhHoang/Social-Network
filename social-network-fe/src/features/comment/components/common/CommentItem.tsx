'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils/time';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { CommentReactionButton } from '@/components/wrappers/CommentReaction';
import {
  CommentWithMyReaction,
  transformToCommentWithMyReaction,
} from '@/features/comment/types/comment';
import { useReplyStore } from '@/features/comment/store/reply-comments/reply.store';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { toast } from 'sonner';
import {
  useGetCommentReplies,
  useDeleteComment,
} from '@/features/comment/hooks/useComment';
import ContainedMedia from '@/features/media/components/common/ContainedMedia';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit2, Flag, MoreHorizontal, Trash2 } from 'lucide-react';
import CommentEditor from '@/features/comment/components/editor/CommentEditor';
import { useStore } from '@/store';
import { ReportDialog } from '@/features/report/components/ReportDialog';
import { useImageViewer } from '@/components/provider/ImageViewerProvider';

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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const setReplyingTo = useReplyStore((state) => state.setReplyingTo);
  const currentUser = useStore((state) => state.user);
  const { open: openImage } = useImageViewer();
  const shouldFetchReplies = level === 0 && showReplies;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetCommentReplies(comment.id, 5, { enabled: shouldFetchReplies });

  const { mutateAsync: deleteComment, isPending: isDeleting } =
    useDeleteComment();

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      toast.success('Xóa bình luận thành công');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Xóa bình luận thất bại');
    }
  };

  const replies =
    data?.pages
      .flatMap((page) => page.data)
      .map((rp) => transformToCommentWithMyReaction(rp)) ?? [];

  const contentHtml = comment.content
    ? generateHTML(comment.content, [StarterKit, Emoji])
    : '';

  const indentationStyle = level > 0 ? { paddingLeft: '48px' } : {};

  const isOwner = currentUser?.id === comment.author.id;

  return (
    <div className="flex gap-3 mb-0 group">
      <div style={indentationStyle}>
        <UserAvatar
          name={comment.author.firstName}
          src={comment.author.avatar}
        />
      </div>

      <div className="flex-1 min-w-0">
        {!isEditing ? (
          <>
            <div className="bg-gray-100 rounded-lg px-3 py-2 relative">
              <span className="font-semibold text-sm">
                {comment.author.firstName}
              </span>
              {comment.replyToUser && (
                <span className="text-sm text-gray-500 ml-1">
                  Trả lời{' '}
                  <span className="font-semibold text-gray-700">
                    {comment.replyToUser.firstName}{' '}
                    {comment.replyToUser.lastName} @
                    {comment.replyToUser.username}
                  </span>
                </span>
              )}
              {contentHtml && (
                <div
                  className="text-sm prose"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
                    >
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner ? (
                      <>
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setShowReportDialog(true)}
                      >
                        <Flag className="mr-2 h-4 w-4" />
                        Báo cáo
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {comment.media && (
              <ContainedMedia
                height={comment.media.height || 200}
                mediaType={comment.media.mediaType}
                url={comment.media.url}
                width={comment.media.width || 200}
                onClick={() =>
                  comment.media &&
                  openImage({
                    imgId: comment.media.mediaId,
                    url: comment.media.url,
                    height: comment.media.height,
                    width: comment.media.width,
                  })
                }
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
                onClick={() => {
                  setReplyingTo({ comment, rootId: comment.id });
                }}
              >
                Trả lời
              </button>
            </div>
          </>
        ) : (
          <div className="mt-1">
            <CommentEditor
              postId={postId}
              mode="edit"
              data={{
                _id: comment.id,
                content: comment.content,
                media: comment.media
                  ? {
                      id: comment.media.mediaId,
                      mediaType: comment.media.mediaType,
                      url: comment.media.url,
                      width: comment.media.width,
                      height: comment.media.height,
                    }
                  : undefined,
              }}
              onSuccess={() => setIsEditing(false)}
              variant="boxed"
              autoFocus
            />
            <div className="flex justify-end mt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="text-xs h-8"
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

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
                rootId={comment.id}
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
              className="!p-0 !h-auto !font-semibold !text-gray-500 !hover:bg-transparent !hover:text-gray-500 flex items-center gap-4"
            >
              <span className="block w-6 border-t border-gray-500"></span>
              <span>Ẩn các phản hồi</span>
            </Button>
          </div>
        )}

        <ConfirmDeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Xóa bình luận?"
          description="Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác."
          isPending={isDeleting}
        />

        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          targetType="comment"
          targetId={comment.id}
        />
      </div>
    </div>
  );
}
