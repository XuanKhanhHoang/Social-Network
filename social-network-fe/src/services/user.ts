import {
  GetPostsFeedResponseDto,
  GetUserBioResponseDto,
  GetUserFriendsPreviewResponseDto,
  GetUserHeaderResponseDto,
  GetUserPhotosResponseDto,
  GetUserProfileResponseDto,
} from '@/lib/dtos';
import { ApiClient } from './api';
import { CursorPaginationParams, RequestOptions } from './type';

const USER_PREFIX = '/users';

const buildEndpointWithParams = (
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>
) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

export const userService = {
  async getHeader(username: string): Promise<GetUserHeaderResponseDto> {
    return ApiClient.get(`${USER_PREFIX}/${username}/header`);
  },

  async getProfile(username: string): Promise<GetUserProfileResponseDto> {
    return ApiClient.get(`${USER_PREFIX}/${username}/profile`);
  },

  async getBio(username: string): Promise<GetUserBioResponseDto> {
    return ApiClient.get(`${USER_PREFIX}/${username}/bio`);
  },

  async getFriendsPreview(
    username: string,
    page?: number,
    limit?: number
  ): Promise<GetUserFriendsPreviewResponseDto> {
    const endpoint = buildEndpointWithParams(
      `${USER_PREFIX}/${username}/friends-preview`,
      {
        page,
        limit,
      }
    );
    return ApiClient.get(endpoint);
  },

  async getPhotosPreview(
    username: string,
    page?: number,
    limit?: number
  ): Promise<GetUserPhotosResponseDto> {
    const endpoint = buildEndpointWithParams(
      `${USER_PREFIX}/${username}/photos-preview`,
      {
        page,
        limit,
      }
    );
    return ApiClient.get(endpoint);
  },
  async getUserPosts({
    username,
    queriesOptions,
    options,
  }: {
    username: string;
    queriesOptions: CursorPaginationParams;
    options?: RequestOptions;
  }): Promise<GetPostsFeedResponseDto> {
    const queries = new URLSearchParams();
    const { cursor, limit } = queriesOptions;

    if (cursor) queries.set('cursor', cursor);
    if (limit) queries.set('limit', limit.toString());

    const queryString = queries.toString();
    return ApiClient.get(
      `${USER_PREFIX}/${username}/posts${queryString ? `?${queryString}` : ''}`,
      options
    );
  },
};
