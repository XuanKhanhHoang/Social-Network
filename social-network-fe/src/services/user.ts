import {
  GetPostsFeedResponseDto,
  GetUserBioResponseDto,
  GetUserFriendsPreviewResponseDto,
  GetUserHeaderResponseDto,
  GetUserPhotosResponseDto,
  GetUserProfileResponseDto,
} from '@/lib/dtos';
import { ApiClient } from './api';

const USER_PREFIX = '/users';

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
