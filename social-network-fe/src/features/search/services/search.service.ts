import { ApiClient } from '@/services/api';
import { SearchPostResponseDto, SearchUserResponseDto } from '../types';

export const searchService = {
  searchUsers: async (params: {
    search: string;
    limit: number;
    cursor?: string;
  }): Promise<SearchUserResponseDto> => {
    const searchParams = new URLSearchParams();
    searchParams.append('search', params.search);
    searchParams.append('limit', params.limit.toString());
    if (params.cursor) {
      searchParams.append('cursor', params.cursor);
    }
    return ApiClient.get(`/users/search?${searchParams.toString()}`);
  },

  searchPosts: async (params: {
    search: string;
    limit: number;
    cursor?: string;
  }): Promise<SearchPostResponseDto> => {
    const searchParams = new URLSearchParams();
    searchParams.append('search', params.search);
    searchParams.append('limit', params.limit.toString());
    if (params.cursor) {
      searchParams.append('cursor', params.cursor);
    }
    return ApiClient.get(`/posts/search?${searchParams.toString()}`);
  },
};
