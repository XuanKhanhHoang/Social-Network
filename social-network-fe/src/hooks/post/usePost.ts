import {
  CreatePostRequestDto,
  GetPostsFeedResponseDto,
  PostWithMyReactionDto,
} from '@/lib/dtos';
import { feedService } from '@/services/feed';
import { postService } from '@/services/post';
import { userService } from '@/services/user';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (username?: string) =>
    username
      ? ([...postKeys.lists(), 'user', username] as const)
      : ([...postKeys.lists(), 'home'] as const),
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
export function useInfiniteHomeFeed({ limit }: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: postKeys.list(),
    queryFn: ({ pageParam }) =>
      feedService.getHomeFeed({
        queriesOptions: {
          cursor: pageParam,
          limit,
        },
      }),
    getNextPageParam: (lastPage: GetPostsFeedResponseDto) => {
      return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
  });
}
export function useInfiniteUserPosts({
  limit,
  username,
}: {
  limit?: number;
  username: string;
}) {
  return useInfiniteQuery({
    queryKey: postKeys.list(username),
    queryFn: ({ pageParam }) =>
      userService.getUserPosts({
        username,
        queriesOptions: {
          cursor: pageParam,
          limit,
        },
      }),
    getNextPageParam: (lastPage: GetPostsFeedResponseDto) => {
      return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!username,
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
