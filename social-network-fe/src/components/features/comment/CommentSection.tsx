import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { Post } from '@/types-define/dtos';
import { ExpandableContent } from '@/components/ui/ExpandableContent';
import { Button } from '@/components/ui/button';
import CommentItem from './CommentItem';
import { PostReactionButton } from '@/components/wrappers/PostReaction';
import { useGetRootComments } from '@/hooks/comment/useComment';

export function CommentSection({
  postId,
  post,
  postContentHtml,
}: {
  postId: string;
  post: Post;
  postContentHtml: string;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetRootComments(postId);

  const comments = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 flex-shrink-0">
        {postContentHtml && (
          <ExpandableContent html={postContentHtml} maxHeight={320} />
        )}
      </div>

      <div className="border-y flex-shrink-0 px-4 py-2">
        <div className="flex items-center space-x-6 text-gray-500 ">
          <PostReactionButton
            postId={post._id}
            initialCount={post.reactionsCount}
            initialReaction={post.myReaction}
            btnClassName="px-2 py-1"
          />
          <button className="flex items-center space-x-2 hover:text-indigo-500 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
            <Send className="w-5 h-5" />
            <span className="text-sm font-medium">{post.sharesCount}</span>
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 space-y-4 mt-4">
        {isLoading && (
          <p className="text-sm text-gray-500">Loading comments...</p>
        )}

        {comments.map((comment) => (
          <CommentItem postId={post._id} comment={comment} key={comment._id} />
        ))}

        {hasNextPage && (
          <Button
            variant="link"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="p-0 h-auto"
          >
            {isFetchingNextPage ? 'Loading more...' : 'View more comments'}
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}
