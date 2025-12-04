import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { commentService } from '@/features/comment/services/comment.service';
import {
  CommentDto,
  CreateCommentRequestDto,
  GetCommentsResponseDto,
  UpdateCommentRequestDto,
} from '@/features/comment/services/comment.dto';
import { postKeys } from '@/features/post/hooks/usePost';
import { useUpdatePostCache } from '@/features/post/hooks/usePostCache';
import { GetPostsFeedResponseDto } from '@/lib/dtos';

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  rootList: (postId: string) =>
    [...commentKeys.lists(), postId, 'root'] as const,
  replyList: (parentId: string) =>
    [...commentKeys.lists(), 'replies', parentId] as const,
};

export function useGetRootComments(postId: string, limit: number = 10) {
  return useInfiniteQuery<
    GetCommentsResponseDto,
    Error,
    InfiniteData<GetCommentsResponseDto>
  >({
    queryKey: commentKeys.rootList(postId),
    queryFn: ({ pageParam }) =>
      commentService.getPostComments({
        postId,
        cursor: pageParam as string | undefined,
        limit,
      }),
    getNextPageParam: (lastPage: GetCommentsResponseDto) =>
      lastPage.hasNextPage ? lastPage.cursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!postId,
  });
}

export function useGetCommentReplies(
  parentId: string,
  limit: number = 5,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery<
    GetCommentsResponseDto,
    Error,
    InfiniteData<GetCommentsResponseDto>
  >({
    queryKey: commentKeys.replyList(parentId),
    queryFn: ({ pageParam }) =>
      commentService.getCommentReplies({
        commentId: parentId,
        cursor: pageParam as string | undefined,
        limit,
      }),
    getNextPageParam: (lastPage: GetCommentsResponseDto) =>
      lastPage.hasNextPage ? lastPage.cursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!parentId && (options?.enabled ?? true),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { incrementComments } = useUpdatePostCache();

  return useMutation({
    mutationFn: (data: CreateCommentRequestDto) =>
      commentService.createComment(data),
    onSuccess: (newComment, variables) => {
      const exactRootKey = commentKeys.rootList(variables.postId);

      queryClient.setQueryData<InfiniteData<GetCommentsResponseDto>>(
        exactRootKey,
        (oldData) => {
          if (!oldData) return oldData;

          const targetId = newComment.rootId || variables.parentId;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              const updatedList = page.data.map((comment) => {
                const currentId = comment._id;
                if (String(currentId) === String(targetId)) {
                  return {
                    ...comment,
                    repliesCount: (comment.repliesCount || 0) + 1,
                  };
                }
                return comment;
              });

              return {
                ...page,
                data: updatedList,
              };
            }),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: exactRootKey });

      if (newComment.rootId || variables.parentId) {
        const targetListId = (newComment.rootId ||
          variables.parentId) as string;
        const replyListKey = commentKeys.replyList(targetListId);
        queryClient.invalidateQueries({ queryKey: replyListKey });
      }

      incrementComments(variables.postId);

      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation<
    CommentDto,
    Error,
    { commentId: string; data: UpdateCommentRequestDto }
  >({
    mutationFn: ({ commentId, data }) =>
      commentService.updateComment(commentId, data),
    onSuccess: (updatedComment, variables) => {
      queryClient.setQueriesData<InfiniteData<GetCommentsResponseDto>>(
        { queryKey: commentKeys.lists() },
        (oldData) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((comment) => {
                if (comment._id === variables.commentId) {
                  return {
                    ...comment,
                    ...updatedComment,
                    isEdited: true,
                  };
                }
                return comment;
              }),
            })),
          };
        }
      );

      queryClient.setQueriesData<InfiniteData<GetPostsFeedResponseDto>>(
        { queryKey: postKeys.lists() },
        (oldData) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (
                  post.topComment &&
                  post.topComment._id === variables.commentId
                ) {
                  return {
                    ...post,
                    topComment: {
                      ...post.topComment,
                      content: updatedComment.content,
                      media: updatedComment.media,
                      isEdited: true,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        }
      );
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { decrementComments } = useUpdatePostCache();
  return useMutation<CommentDto, Error, string>({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: (deletedComment, variables) => {
      queryClient.setQueriesData<InfiniteData<GetCommentsResponseDto>>(
        { queryKey: commentKeys.lists() },
        (oldData) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.filter((comment) => comment._id !== variables),
            })),
          };
        }
      );

      queryClient.setQueriesData<InfiniteData<GetPostsFeedResponseDto>>(
        { queryKey: postKeys.lists() },
        (oldData) => {
          if (!oldData || !oldData.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post._id === deletedComment.postId) {
                  return {
                    ...post,
                    commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      if (deletedComment.rootId) {
        const rootListKey = commentKeys.rootList(deletedComment.postId);
        queryClient.setQueryData<InfiniteData<GetCommentsResponseDto>>(
          rootListKey,
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data.map((comment) => {
                  if (comment._id === deletedComment.rootId) {
                    return {
                      ...comment,
                      repliesCount: Math.max(
                        0,
                        (comment.repliesCount || 0) - 1
                      ),
                    };
                  }
                  return comment;
                }),
              })),
            };
          }
        );
      }

      decrementComments(deletedComment.postId);
    },
  });
}
