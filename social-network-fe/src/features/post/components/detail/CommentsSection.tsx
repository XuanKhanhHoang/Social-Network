import { Button } from '@/components/ui/button';
import { useGetRootComments } from '@/features/comment/hooks/useComment';
import { Post } from '@/features/post/types/post';
import CommentItem from '@/features/comment/components/common/CommentItem';
import { transformToCommentWithMyReaction } from '@/features/comment/types/comment';

export default function PostDetailCommentsSection({
  postId,
  post,
}: {
  postId: string;
  post: Post;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetRootComments(postId);

  const comments = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="px-4 pb-2 space-y-4 mt-4">
      {isLoading && (
        <p className="text-sm text-gray-500">Loading comments...</p>
      )}

      {comments.map((comment) => (
        <CommentItem
          postId={post.id}
          comment={transformToCommentWithMyReaction(comment)}
          key={comment._id}
          rootId={comment._id}
        />
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
  );
}
