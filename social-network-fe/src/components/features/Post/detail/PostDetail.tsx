'use client';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import MediaViewer from '../../common/MediaComponent/MediaViewer';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import PostDetailSkeleton from './PostDetailSkeleton';
import { Post } from '@/lib/dtos';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Emoji } from '@/lib/editor/emoji-node';
import CommentEditor from '../../comment/CommentEditor';
import { CommentSection } from '../../comment/CommentSection';
import { PostDetailHeader } from './PostDetailHeader';

export default function PostDetail({
  post,
  initialMediaIndex = 0,
  isError,
  isPending,
}: {
  post?: Post;
  initialMediaIndex?: number;
  isPending: boolean;
  isError: boolean;
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      router.back();
    }
  };

  if (isPending || !post) {
    return <PostDetailSkeleton onOpenChange={() => onOpenChange(false)} />;
  }

  const hasMedia = post.media && post.media.length > 0;
  const contentHtml = post.content
    ? generateHTML(post.content, [StarterKit, Emoji])
    : '';

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
        >
          <DialogTitle className="sr-only">
            Post by {post.author.firstName}
          </DialogTitle>
          <div className="flex w-full h-full overflow-hidden">
            {hasMedia && (
              <div className="flex-1 bg-black flex items-center justify-center">
                <MediaViewer
                  media={post.media}
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
                <CommentSection
                  postId={post._id}
                  post={post}
                  postContentHtml={contentHtml}
                />
              </div>

              <div className="border-t w-full px-3 py-1 bg-white flex-shrink-0">
                <CommentEditor postId={post._id} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
