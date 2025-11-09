'use client';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import PostDetailSkeleton from './Skeleton';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import { PostWithMyReaction } from '@/lib/interfaces/post';
import { PostDetailHeader } from './Header';
import MediasViewer from '../../media/viewers/MediasViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { PostReactionButton } from '@/components/wrappers/PostReaction';
import PostDetailCommentSection from './CommentSection';
import CommentEditor from '../../comment/editor/Editor';
import { useReplyStore } from '@/store/reply-comments/reply.store';

export type PostDetailProps = {
  post?: PostWithMyReaction;
  initialMediaIndex?: number;
  isPending: boolean;
  isError: boolean;
};

export default function PostDetail({
  post,
  initialMediaIndex = 0,
  isError,
  isPending,
}: PostDetailProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { replyingTo, setReplyingTo } = useReplyStore();

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      router.back();
      setReplyingTo(null);
    }
  };

  if (isPending || !post) {
    return <PostDetailSkeleton onOpenChange={() => onOpenChange(false)} />;
  }

  const hasMedia = Boolean(post.media && post.media.length > 0);
  const contentHtml = post.content
    ? generateHTML(post.content, [StarterKit, Emoji])
    : '';
  const isReplying = !!replyingTo;
  const editorParentId = isReplying ? replyingTo.rootId : undefined;
  const editorPlaceholder = isReplying
    ? `Trả lời ${replyingTo.comment.author.firstName}...`
    : 'Viết bình luận...';
  return (
    <>
      {createPortal(
        <button
          onClick={() => onOpenChange(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors fixed top-3 right-3 p-0 z-[99999] pointer-events-auto cursor-pointer bg-black/50 hover:bg-black/80"
        >
          <X size={24} strokeWidth={2.3} color="white" />
        </button>,
        document.body
      )}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className={`${
            hasMedia ? '!max-w-7xl w-[90vw]' : '!max-w-2xl w-full'
          } !h-[90vh] !max-h-[90vh] p-0 gap-0 border-0 data-[state=open]:animate-none data-[state=closed]:animate-none overflow-hidden`}
          showCloseButton={false}
          onInteractOutside={(e) => {
            if (
              (e.target as HTMLElement).closest('[data-emoji-picker="true"]')
            ) {
              e.preventDefault();
            }
          }}
        >
          <DialogTitle className="sr-only">
            Post by {post.author.firstName}
          </DialogTitle>
          <div className="flex w-full h-full overflow-hidden">
            {hasMedia && (
              <div className="flex-1 bg-black flex items-center justify-center">
                <MediasViewer
                  media={post.media!}
                  currentIndex={currentMediaIndex}
                  onIndexChange={setCurrentMediaIndex}
                  onClose={() => onOpenChange(false)}
                />
              </div>
            )}

            <div
              className={`${
                hasMedia ? 'w-96' : 'w-full'
              } bg-white flex flex-col border-l flex-shrink-0 h-full overflow-hidden`}
            >
              <PostDetailHeader post={post} />

              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 flex-shrink-0">
                    {contentHtml && (
                      <ExpandableContent html={contentHtml} maxHeight={320} />
                    )}
                  </div>
                  <div className="border-y flex-shrink-0 px-4 py-2">
                    <div className="flex items-center space-x-6 text-gray-500 ">
                      <PostReactionButton
                        postId={post.id}
                        initialCount={post.reactionsCount}
                        initialReaction={post.myReaction}
                        btnClassName="px-2 py-1"
                      />
                      <button className="flex items-center space-x-2 hover:text-indigo-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {post.commentsCount}
                        </span>
                      </button>
                      <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
                        <Send className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {post.sharesCount}
                        </span>
                      </button>
                    </div>
                  </div>
                  <PostDetailCommentSection postId={post.id} post={post} />
                </ScrollArea>
              </div>

              <div className="border-t w-full px-3 py-1 bg-white flex-shrink-0">
                {isReplying && (
                  <div className="text-sm text-gray-500 px-1 pt-1 flex justify-between items-center">
                    <span className="truncate">
                      Đang trả lời <b>{replyingTo.comment.author.firstName}</b>
                    </span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 rounded-full hover:bg-gray-200 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <CommentEditor
                  postId={post.id}
                  parentId={editorParentId}
                  placeholder={editorPlaceholder}
                  autoFocus={isReplying}
                  onSuccess={() => {
                    if (isReplying) {
                      setReplyingTo(null);
                    }
                  }}
                  variant="minimal"
                  placeholderSize="sm"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
