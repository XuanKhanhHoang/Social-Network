/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactionType } from '@/lib/constants/enums';
import { postService } from '@/services/post';
import {
  Comment,
  CreatePostDto,
  PostWithUserComment,
  PostFullDetail,
  PostListResponse,
} from '@/types-define/dtos';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from '@tanstack/react-query';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (cursor?: string) => [...postKeys.lists(), cursor] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

export function useInfinitePosts(limit: number = 10) {
  return useInfiniteQuery({
    queryKey: postKeys.lists(),
    queryFn: ({ pageParam }) =>
      postService.getPostsByCursor({
        cursor: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage: PostListResponse) => {
      return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
  });
}

export function usePost(postId: string, initialData?: PostFullDetail) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postService.getPost(postId),
    initialData,
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostDto) => postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePostCache() {
  const queryClient = useQueryClient();

  const updatePostInInfiniteQuery = (
    postId: string,
    updater: (post: PostWithUserComment) => PostWithUserComment
  ) => {
    queryClient.setQueryData<
      InfiniteData<PostListResponse, string | undefined>
    >(postKeys.lists(), (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data:
            page.data?.map((post: PostWithUserComment) =>
              post._id === postId ? updater(post) : post
            ) || [],
        })),
      };
    });
  };

  const updatePostEverywhere = (
    postId: string,
    updater: (post: PostWithUserComment) => PostWithUserComment
  ) => {
    queryClient.setQueryData<PostWithUserComment>(
      postKeys.detail(postId),
      (old) => (old ? updater(old) : old)
    );
    updatePostInInfiniteQuery(postId, updater);
  };

  return {
    updatePost: (
      postId: string,
      updater: (old: PostWithUserComment) => PostWithUserComment
    ) => {
      updatePostEverywhere(postId, updater);
    },

    incrementComments: (postId: string) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        commentsCount: old.commentsCount + 1,
      }));
    },

    decrementComments: (postId: string) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        commentsCount: Math.max(0, old.commentsCount - 1),
      }));
    },

    addUserComment: (postId: string, newComment: Comment) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        commentsCount: old.commentsCount + 1,
        userComments: old.userComments
          ? [...old.userComments, newComment]
          : [newComment],
      }));
    },

    removeUserComment: (postId: string, commentId: string) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        commentsCount: Math.max(0, old.commentsCount - 1),
        userComments: old.userComments
          ? old.userComments.filter((c) => c._id !== commentId)
          : [],
      }));
    },

    updateUserComment: (
      postId: string,
      commentId: string,
      updater: (comment: Comment) => Comment
    ) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        userComments: old.userComments
          ? old.userComments.map((c) => (c._id === commentId ? updater(c) : c))
          : [],
      }));
    },

    updateUserReaction: (
      postId: string,
      reactionType: ReactionType | null,
      oldReactionType?: ReactionType | null
    ) => {
      updatePostEverywhere(postId, (old) => {
        const newBreakdown = { ...old.reactionsBreakdown };
        let countChange = 0;

        if (oldReactionType) {
          newBreakdown[oldReactionType] = Math.max(
            0,
            (newBreakdown[oldReactionType] || 0) - 1
          );
          countChange -= 1;
        }

        if (reactionType) {
          newBreakdown[reactionType] = (newBreakdown[reactionType] || 0) + 1;
          countChange += 1;
        }

        return {
          ...old,
          userReaction: reactionType,
          reactionsCount: Math.max(0, old.reactionsCount + countChange),
          reactionsBreakdown: newBreakdown,
        };
      });
    },

    updateReactionFromSocket: (
      postId: string,
      reactionType: ReactionType,
      increment: boolean
    ) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        reactionsCount: old.reactionsCount + (increment ? 1 : -1),
        reactionsBreakdown: {
          ...old.reactionsBreakdown,
          [reactionType]: Math.max(
            0,
            (old.reactionsBreakdown[reactionType] || 0) + (increment ? 1 : -1)
          ),
        },
      }));
    },

    incrementShares: (postId: string) => {
      updatePostEverywhere(postId, (old) => ({
        ...old,
        sharesCount: old.sharesCount + 1,
      }));
    },

    refreshPost: async (postId: string) => {
      try {
        const freshPost = await queryClient.fetchQuery({
          queryKey: postKeys.detail(postId),
          queryFn: () => postService.getPost(postId),
        });

        if (freshPost) {
          updatePostInInfiniteQuery(postId, () => freshPost);
        }

        return freshPost;
      } catch (error) {
        console.error('Failed to refresh post:', error);
        return null;
      }
    },

    invalidateFeed: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  };
}
