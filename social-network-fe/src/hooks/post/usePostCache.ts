import { InfiniteData, useQueryClient } from '@tanstack/react-query';
import { ReactionType } from '@/lib/constants/enums';
import { getUpdatedReactionState } from '@/lib/cache/reaction-updater';
import { postService } from '@/services/post';
import { postKeys } from './usePost';
import { GetPostsFeedResponseDto, PostWithTopCommentDto } from '@/lib/dtos';

type PostUpdater = (oldPost: PostWithTopCommentDto) => PostWithTopCommentDto;

export function useUpdatePostCache() {
  const queryClient = useQueryClient();

  const updatePostInAllCaches = (postId: string, updater: PostUpdater) => {
    queryClient.setQueriesData<
      InfiniteData<GetPostsFeedResponseDto, string | undefined>
    >({ queryKey: postKeys.lists() }, (oldData) => {
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

    queryClient.setQueryData<PostWithTopCommentDto>(
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
        getUpdatedReactionState<PostWithTopCommentDto>(
          post,
          newReaction,
          previousReaction
        )
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
          updatePostInAllCaches(postId, (oldPost) => ({
            ...freshPost,
            topComment: oldPost.topComment,
          }));
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
