'use client';
import { X, MessageCircle, Send } from 'lucide-react';
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
import MediasViewer from '@/components/features/media/viewers/MediasViewer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { PostReactionButton } from '@/components/wrappers/PostReaction';
import CommentEditor from '@/components/features/comment/editor/Editor';
import { useReplyStore } from '@/store/reply-comments/reply.store';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import PostDetailCommentsSection from './CommentsSection';
import { cn } from '@/lib/utils';

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
    ? generateHTML(post.content, [
        StarterKit,
        Emoji,
        TextStyle,
        Color,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ])
    : '';
  const isReplying = !!replyingTo;
  const editorParentId = isReplying ? replyingTo.rootId : undefined;
  const editorPlaceholder = isReplying
    ? `Trả lời ${replyingTo.comment.author.firstName}...`
    : 'Viết bình luận...';

  const dialogContentClasses = cn(
    'p-0 gap-0 border-0 data-[state=open]:animate-none data-[state=closed]:animate-none overflow-hidden outline-none',
    hasMedia
      ? [
          'w-[100vw] h-[100dvh] max-w-none rounded-none',
          'md:w-[95vw] md:h-[90vh] md:max-w-[1600px] md:rounded-lg',
        ]
      : 'w-full max-w-2xl h-fit max-h-[90vh] rounded-lg'
  );

  const sidebarClasses = cn(
    'bg-white flex flex-col border-l flex-shrink-0 h-full overflow-hidden',
    hasMedia ? 'w-full h-[60%] md:h-full md:w-[400px] lg:w-[450px]' : 'w-full'
  );

  const mainLayoutClasses = cn(
    'flex w-full h-full overflow-hidden',
    hasMedia ? 'flex-col md:flex-row' : ''
  );

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
          className={dialogContentClasses}
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

          <div className={mainLayoutClasses}>
            {hasMedia && (
              <div className="bg-black flex items-center justify-center flex-shrink-0 relative overflow-hidden w-full h-[40%] md:h-full md:flex-1">
                <MediasViewer
                  media={post.media!}
                  currentIndex={currentMediaIndex}
                  onIndexChange={setCurrentMediaIndex}
                  onClose={() => onOpenChange(false)}
                />
              </div>
            )}

            <div className={sidebarClasses}>
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

                  <PostDetailCommentsSection postId={post.id} post={post} />
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
