'use client';
import { Bookmark, MessageCircle, Send, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PostFullDetail } from '@/types-define/dtos';
import MediaViewer from '../../common/MediaComponent/MediaViewer';
import { useRouter } from 'next/navigation';
import CommentEditor from '../../comment/CommentEditor';
import StarterKit from '@tiptap/starter-kit';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { generateHTML } from '@tiptap/react';
import { Emoji } from '@/lib/editor/emoji-node';
import ReactionButton from '@/components/ui/reaction-button';
import { timeAgo } from '@/lib/utils/time';
import { createPortal } from 'react-dom';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import CommentItem from '../../comment/CommentItem';
import PostDetailSkeleton from './PostDetailSkeleton';

export default function PostDetail({
  post,
  initialMediaIndex = 0,
  isError,
  isPending,
}: {
  post?: PostFullDetail;
  initialMediaIndex?: number;
  isPending: boolean;
  isError: boolean;
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);
  const [isOpen, setIsOpen] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    router.back();
  };
  if (isPending || !post)
    return <PostDetailSkeleton onOpenChange={onOpenChange} />;
  const hasMedia = post.media && post.media.length > 0;

  const contentHtml = generateHTML(post?.content, [
    StarterKit,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Emoji,
  ]);
  return (
    <>
      {createPortal(
        <button className="w-8 h-8 rounded-full flex items-center justify-center transition-colors fixed top-3 right-3 p-0 z-[99999] pointer-events-auto cursor-pointer">
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
                <div className="w-full h-full max-w-none">
                  <MediaViewer
                    media={post.media}
                    currentIndex={currentMediaIndex}
                    onIndexChange={setCurrentMediaIndex}
                    onClose={() => onOpenChange(false)}
                  />
                </div>
              </div>
            )}

            <div
              className={`${
                hasMedia ? 'w-96' : 'w-full'
              } bg-white flex flex-col border-l flex-shrink-0 h-full overflow-hidden`}
            >
              <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.firstName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold text-sm">
                      {post.author.firstName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </div>

              <div className="p-4 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    {contentHtml && (
                      <ExpandableContent
                        html={contentHtml}
                        maxHeight={hasMedia ? 320 : 400}
                        maxHeightExpanded={hasMedia ? 450 : 600}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="border-y flex-shrink-0">
                <div className="px-4 py-2">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <ReactionButton
                        entityId={post._id}
                        showCount={true}
                        showLabel={false}
                        iconSize={24}
                        initialCount={post.reactionsCount}
                        initialReaction={post.userReactionType}
                        btnClassName="h-8 w-8 p-1"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageCircle size={24} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Send size={24} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSaved(!saved)}
                    >
                      <Bookmark
                        size={24}
                        className={saved ? 'fill-current' : ''}
                      />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="px-4 pb-2 space-y-4">
                  {post.userComments &&
                    post.userComments.length > 0 &&
                    post.userComments.map((comment, i) => (
                      <CommentItem
                        comment={comment}
                        key={`comment-${comment._id}-${i}`}
                        showReply={true}
                        className={`flex gap-3 ${i == 0 ? 'mt-2' : ''}`}
                      />
                    ))}
                  {post.userComments &&
                    post.userComments.length > 0 &&
                    post.userComments.map((comment, i) => (
                      <CommentItem
                        comment={comment}
                        key={`comment-${comment._id}-${i}`}
                        showReply={true}
                        className={`flex gap-3`}
                      />
                    ))}
                </div>
              </ScrollArea>

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
