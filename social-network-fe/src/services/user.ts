import { GetProfileResponseDto } from '@/lib/dtos/user';
import { ApiClient } from './api';

export const userService = {
  async getProfile(username: string): Promise<GetProfileResponseDto> {
    return ApiClient.get<GetProfileResponseDto>(`/user/profile/${username}`);
  },
};
