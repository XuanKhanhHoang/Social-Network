import { useInfiniteQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { SuggestedMessagingUsersResponseDto } from '../types/chat.dto';
import { mapSuggestedUserDtoToDomain } from '../utils/chat.mapper';

export const chatKeys = {
  all: ['chat'] as const,
  suggested: () => [...chatKeys.all, 'suggested'] as const,
};

export function useSuggestedMessagingUsers({
  limit = 12,
}: { limit?: number } = {}) {
  return useInfiniteQuery({
    queryKey: chatKeys.suggested(),
    queryFn: ({ pageParam }) =>
      chatService.getSuggestedMessagingUsers({
        limit,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage: SuggestedMessagingUsersResponseDto) => {
      return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    select: (data) =>
      data.pages.flatMap((page) => page.data.map(mapSuggestedUserDtoToDomain)),
  });
}
