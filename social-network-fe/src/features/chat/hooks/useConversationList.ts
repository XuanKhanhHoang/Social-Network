import { useInfiniteQuery } from '@tanstack/react-query';
import { chatKeys } from './useChat';
import { chatService } from '../services/chat.service';
import { SearchConversationsResponseDto } from '../services/chat.dto';
import { mapSearchConversationDtoToDomain } from '../utils/chat.mapper';

export function useConversationList(search?: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.conversations(search),
    queryFn: ({ pageParam }) => {
      return chatService.searchConversations({
        cursor: pageParam,
        search,
      });
    },
    getNextPageParam: (lastPage: SearchConversationsResponseDto) => {
      return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: Infinity,
    select: (data) =>
      data.pages.flatMap((page) => {
        return page.data.map(mapSearchConversationDtoToDomain);
      }),
    gcTime: search ? 0 : Infinity,
  });
}
