import {
  CreatePostRequestDto,
  GetPostsFeedResponseDto,
  PostWithMyReactionDto,
} from '@/lib/dtos';
import { postService } from '@/services/post';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
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
    getNextPageParam: (lastPage: GetPostsFeedResponseDto) => {
      return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
  });
}

export function usePost(postId: string, initialData?: PostWithMyReactionDto) {
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
    mutationFn: (data: CreatePostRequestDto) => postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
