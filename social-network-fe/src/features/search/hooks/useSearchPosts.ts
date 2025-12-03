import { useInfiniteQuery } from '@tanstack/react-query';
import { searchService } from '../services/search.service';

export const useSearchPosts = (
  search: string,
  enabled: boolean = true,
  limit: number = 12
) => {
  return useInfiniteQuery({
    queryKey: ['search', 'posts', search, limit],
    queryFn: async ({ pageParam }) => {
      return searchService.searchPosts({
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
