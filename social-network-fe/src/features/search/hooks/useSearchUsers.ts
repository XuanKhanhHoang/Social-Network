import { useInfiniteQuery } from '@tanstack/react-query';
import { searchService } from '../services/search.service';

export const useSearchUsers = (
  search: string,
  enabled: boolean = true,
  limit: number = 12
) => {
  return useInfiniteQuery({
    queryKey: ['search', 'users', search, limit],
    queryFn: async ({ pageParam }) => {
      return searchService.searchUsers({
        search,
        limit,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    enabled: enabled && !!search,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
