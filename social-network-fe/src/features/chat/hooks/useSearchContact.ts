import { chatService } from '@/features/chat/services/chat.service';
import { useQuery } from '@tanstack/react-query';
import { mapSuggestedMessagingUserDtoToDomain } from '../types/chat';

export const useSearchContact = (query: string) => {
  const isDefaultList = !query || query.trim().length === 0;

  return useQuery({
    queryKey: ['search-contact', query],
    queryFn: () => chatService.searchMessagingUsers({ query, limit: 10 }),
    enabled: true,
    staleTime: isDefaultList ? 1000 * 60 : 0,
    gcTime: isDefaultList ? 1000 * 60 * 5 : 1000 * 60,
    select: (data) => ({
      data: data.data.map(mapSuggestedMessagingUserDtoToDomain),
      pagination: data.pagination,
    }),
  });
};
