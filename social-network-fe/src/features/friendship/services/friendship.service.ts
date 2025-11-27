import { ApiClient } from '@/services/api';
import {
  AcceptFriendRequestDto,
  GetReceivedFriendRequestsResponseDto,
  GetSuggestedFriendsResponseDto,
  SendFriendRequestDto,
  AcceptFriendRequestResponseDto,
  SendFriendRequestResponseDto,
  RemoveFriendResponseDto,
  GetSentFriendRequestsResponseDto,
} from '@/lib/dtos/friendship';
import { UserSummaryDto } from '@/lib/dtos';

export const FriendshipService = {
  acceptFriendRequest: async (data: AcceptFriendRequestDto) => {
    return ApiClient.post<AcceptFriendRequestResponseDto>(
      '/friendships/accept',
      data
    );
  },

  removeFriend: async (targetUserId: string) => {
    return ApiClient.delete<RemoveFriendResponseDto>(
      `/friendships/remove/${targetUserId}`
    );
  },
  sendFriendRequest: async (data: SendFriendRequestDto) => {
    return ApiClient.post<SendFriendRequestResponseDto>(
      '/friendships/request',
      data
    );
  },
  cancelFriendRequest: async (targetUserId: string) => {
    return ApiClient.delete<RemoveFriendResponseDto>(
      `/friendships/cancel/${targetUserId}`
    );
  },
  denyFriendRequest: async (targetUserId: string) => {
    return ApiClient.delete<RemoveFriendResponseDto>(
      `/friendships/deny/${targetUserId}`
    );
  },
  getReceivedFriendRequests: async ({
    limit = 10,
    cursor,
  }: {
    limit?: number;
    cursor?: string;
  }) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    return ApiClient.get<GetReceivedFriendRequestsResponseDto>(
      `/friendships/requests/received?${params.toString()}`
    );
  },

  getSentFriendRequests: async ({
    limit = 10,
    cursor,
  }: {
    limit?: number;
    cursor?: string;
  }) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    return ApiClient.get<GetSentFriendRequestsResponseDto>(
      `/friendships/requests/sent?${params.toString()}`
    );
  },

  getSuggestedFriends: async ({
    limit = 10,
    cursor,
  }: {
    limit?: number;
    cursor?: string;
  }) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    return ApiClient.get<GetSuggestedFriendsResponseDto>(
      `/friendships/suggested?${params.toString()}`
    );
  },

  getFriends: async ({
    username,
    limit = 10,
    cursor,
    search,
  }: {
    username: string;
    limit?: number;
    cursor?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);
    if (search) params.append('search', search);

    return ApiClient.get<GetSuggestedFriendsResponseDto>(
      `/users/${username}/friends-preview?${params.toString()}`
    );
  },

  getBlockedUsers: async ({
    limit = 10,
    cursor,
  }: {
    limit?: number;
    cursor?: string;
  }) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    return ApiClient.get<GetSuggestedFriendsResponseDto>(
      `/friendships/blocked?${params.toString()}`
    );
  },

  searchUsers: async ({
    query,
    limit = 10,
    cursor,
  }: {
    query: string;
    limit?: number;
    cursor?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    return ApiClient.get<{
      data: UserSummaryDto[];
      pagination: { hasMore: boolean; nextCursor: string | null };
    }>(`/users/search?${params.toString()}`);
  },
};
