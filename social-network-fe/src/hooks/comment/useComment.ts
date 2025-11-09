import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { commentService } from '@/services/comment';
import {
  CreateCommentRequestDto,
  GetCommentsResponseDto,
  UpdateCommentRequestDto,
} from '@/lib/dtos';

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  rootList: (postId: string) =>
    [...commentKeys.lists(), postId, 'root'] as const,
  replyList: (parentId: string) =>
    [...commentKeys.lists(), 'replies', parentId] as const,
};

export function useGetRootComments(postId: string, limit: number = 10) {
  return useInfiniteQuery({
    queryKey: commentKeys.rootList(postId),
    queryFn: ({ pageParam }) =>
      commentService.getPostComments({
        postId,
        cursor: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage: GetCommentsResponseDto) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!postId,
  });
}

export function useGetCommentReplies(
  parentId: string,
  limit: number = 5,
  options?: { enabled?: boolean }
) {
  return useInfiniteQuery({
    queryKey: commentKeys.replyList(parentId),
    queryFn: ({ pageParam }) =>
      commentService.getCommentReplies({
        commentId: parentId,
        cursor: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage: GetCommentsResponseDto) =>
      lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!parentId && (options?.enabled ?? true),
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequestDto) =>
      commentService.createComment(data),
    onSuccess: (_, variables) => {
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.replyList(variables.parentId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: commentKeys.rootList(variables.postId),
        });
      }
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentRequestDto;
    }) => commentService.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.lists() });
    },
  });
}
