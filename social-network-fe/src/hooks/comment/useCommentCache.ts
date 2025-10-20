import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { getUpdatedReactionState } from '@/lib/cache/reaction-updater';
import type { ReactionType } from '@/lib/constants/enums';
import { Comment, GetCommentListResponse } from '@/lib/dtos';
import { commentKeys } from './useComment';

type CommentUpdater = (oldComment: Comment) => Comment;

export function useUpdateCommentCache() {
  const queryClient = useQueryClient();
  const updateCommentInAllCaches = (
    commentId: string,
    updater: CommentUpdater
  ) => {
    queryClient.setQueriesData<InfiniteData<GetCommentListResponse>>(
      { queryKey: commentKeys.lists() },
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((comment) =>
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
      updateCommentInAllCaches(commentId, (comment) =>
        getUpdatedReactionState(comment, newReaction, previousReaction)
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
  };
}
