import { PostListResponse, PostWithTopComment } from '@/types-define/dtos';
import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { ReactionType } from '@/lib/constants/enums';
import { getUpdatedReactionState } from '@/lib/cache/reaction-updater';
import { postService } from '@/services/post';
import { postKeys } from './usePost';

type PostUpdater = (oldPost: PostWithTopComment) => PostWithTopComment;

export function useUpdatePostCache() {
  const queryClient = useQueryClient();

  const updatePostInAllCaches = (postId: string, updater: PostUpdater) => {
    queryClient.setQueryData<
      InfiniteData<PostListResponse, string | undefined>
    >(postKeys.lists(), (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data:
            page.data?.map((post) =>
              post._id === postId ? updater(post) : post
            ) ?? [],
        })),
      };
    });

    queryClient.setQueryData<PostWithTopComment>(
      postKeys.detail(postId),
      (oldPost) => (oldPost ? updater(oldPost) : undefined)
    );
  };

  return {
    incrementComments: (postId: string) => {
      updatePostInAllCaches(postId, (post) => ({
        ...post,
        commentsCount: post.commentsCount + 1,
      }));
    },

    decrementComments: (postId: string) => {
      updatePostInAllCaches(postId, (post) => ({
        ...post,
        commentsCount: Math.max(0, post.commentsCount - 1),
      }));
    },

    updateUserReaction: (
      postId: string,
      newReaction: ReactionType | null,
      previousReaction?: ReactionType | null
    ) => {
      updatePostInAllCaches(postId, (post) =>
        getUpdatedReactionState(post, newReaction, previousReaction)
      );
    },

    updateReactionFromSocket: (
      postId: string,
      reactionType: ReactionType,
      increment: boolean
    ) => {
      updatePostInAllCaches(postId, (post) => {
        const change = increment ? 1 : -1;
        return {
          ...post,
          reactionsCount: Math.max(0, post.reactionsCount + change),
          reactionsBreakdown: {
            ...post.reactionsBreakdown,
            [reactionType]: Math.max(
              0,
              (post.reactionsBreakdown[reactionType] || 0) + change
            ),
          },
        };
      });
    },

    incrementShares: (postId: string) => {
      updatePostInAllCaches(postId, (post) => ({
        ...post,
        sharesCount: post.sharesCount + 1,
      }));
    },

    refreshPost: async (postId: string) => {
      try {
        const freshPost = await queryClient.fetchQuery({
          queryKey: postKeys.detail(postId),
          queryFn: () => postService.getPost(postId),
        });

        if (freshPost) {
          updatePostInAllCaches(postId, () => freshPost);
        }
        return freshPost;
      } catch (error) {
        console.error('Failed to refresh post:', error);
        return null;
      }
    },

    invalidateFeed: () => {
      return queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  };
}
