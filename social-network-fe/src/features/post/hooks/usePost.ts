import {
  CreatePostRequestDto,
  CreatePostResponseDto,
  GetPostsFeedResponseDto,
  GetUserPhotosResponseDto,
  PostWithMyReactionDto,
} from '@/lib/dtos';
import { feedService } from '../services/feed.service';
import { postService } from '../services/post.service';
import { userService } from '@/features/user/services/user.service';
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from '@tanstack/react-query';
import { userKeys } from '@/features/user/hooks/useUser';
import { MediaType } from '@/lib/constants/enums';

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
      return lastPage.hasNextPage && lastPage.cursor
        ? lastPage.cursor
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
      return lastPage.hasNextPage && lastPage.cursor
        ? lastPage.cursor
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
    onSuccess: (res: CreatePostResponseDto) => {
      const username = res.author.username;
      if (!username) return;

      queryClient.setQueryData(
        postKeys.list(username),
        (oldData: InfiniteData<GetPostsFeedResponseDto> | undefined) => {
          if (!oldData || !oldData.pages.length) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) =>
              index === 0 ? { ...page, data: [res, ...page.data] } : page
            ),
          };
        }
      );
      if (!res.media || res.media.length == 0) return;
      const newPhotos = res.media.filter(
        (m) => m.mediaType === MediaType.IMAGE
      );
      if (newPhotos.length > 0) {
        queryClient.setQueryData(
          userKeys.photo(username),
          (oldData: InfiniteData<GetUserPhotosResponseDto> | undefined) => {
            if (!oldData || !oldData.pages.length) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page, index) =>
                index === 0
                  ? { ...page, data: [...newPhotos, ...page.data] }
                  : page
              ),
            };
          }
        );
      }
    },
  });
}
