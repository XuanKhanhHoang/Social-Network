import {
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
    username: string
  ): Promise<GetUserFriendsPreviewResponseDto> {
    return ApiClient.get(`${USER_PREFIX}/${username}/friends-preview`);
  },

  async getPhotosPreview(username: string): Promise<GetUserPhotosResponseDto> {
    return ApiClient.get(`${USER_PREFIX}/${username}/photos-preview`);
  },
};
