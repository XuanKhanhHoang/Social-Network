import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import {
  getUpdatedReactionState,
  Reactable,
} from '@/lib/cache/reaction-updater';
import type { ReactionType } from '@/lib/constants/enums';
import { commentKeys } from './useComment';
import {
  CommentWithMyReactionDto,
  GetCommentsResponseDto,
} from '@/features/comment/services/comment.dto';

type CommentUpdater = (
  oldComment: CommentWithMyReactionDto
) => CommentWithMyReactionDto;

export function useUpdateCommentCache() {
  const queryClient = useQueryClient();
  const updateCommentInAllCaches = (
    commentId: string,
    updater: CommentUpdater
  ) => {
    queryClient.setQueriesData<InfiniteData<GetCommentsResponseDto>>(
      { queryKey: commentKeys.lists() },
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((comment: CommentWithMyReactionDto) =>
              comment._id === commentId ? updater(comment) : comment
            ),
          })),
        };
      }
    );
  };

  return {
    updateUserReaction: (
      commentId: string,
      newReaction: ReactionType | null,
      previousReaction?: ReactionType | null
    ) => {
      updateCommentInAllCaches(
        commentId,
        (comment) =>
          getUpdatedReactionState(
            comment as unknown as Reactable,
            newReaction,
            previousReaction
          ) as CommentWithMyReactionDto
      );
    },
    incrementRepliesCount: (commentId: string) => {
      updateCommentInAllCaches(commentId, (comment) => ({
        ...comment,
        repliesCount: (comment.repliesCount || 0) + 1,
      }));
    },
    decrementRepliesCount: (commentId: string) => {
      updateCommentInAllCaches(commentId, (comment) => ({
        ...comment,
        repliesCount: Math.max(0, (comment.repliesCount || 0) - 1),
      }));
    },
    invalidateRootsComments: (postId: string) => {
      return queryClient.invalidateQueries({
        queryKey: commentKeys.rootList(postId),
      });
    },
    invalidateReplies: (parentId: string) => {
      return queryClient.invalidateQueries({
        queryKey: commentKeys.replyList(parentId),
      });
    },
  };
}
