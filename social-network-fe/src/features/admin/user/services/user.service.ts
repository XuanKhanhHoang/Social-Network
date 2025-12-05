import { ApiClient } from '@/services/api';
import {
  GetUsersParams,
  GetUsersResponse,
  UserDetail,
  UpdateUserDto,
  UpdateUserResponse,
  LockUserResponse,
  DeleteUserResponse,
  RestoreUserResponse,
} from './user.dto';

const ADMIN_USERS_PREFIX = '/admin/users';

export const adminUserService = {
  async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role) queryParams.set('role', params.role);
    if (params?.status) queryParams.set('status', params.status);
    if (params?.isVerified !== undefined)
      queryParams.set('isVerified', String(params.isVerified));
    if (params?.isDeleted !== undefined)
      queryParams.set('isDeleted', String(params.isDeleted));

    const query = queryParams.toString();
    return ApiClient.get(`${ADMIN_USERS_PREFIX}${query ? `?${query}` : ''}`);
  },

  async getUserDetail(userId: string): Promise<UserDetail> {
    return ApiClient.get(`${ADMIN_USERS_PREFIX}/${userId}`);
  },

  async updateUser(
    userId: string,
    data: UpdateUserDto
  ): Promise<UpdateUserResponse> {
    return ApiClient.patch(`${ADMIN_USERS_PREFIX}/${userId}`, data);
  },

  async lockUser(userId: string): Promise<LockUserResponse> {
    return ApiClient.patch(`${ADMIN_USERS_PREFIX}/${userId}/lock`, {});
  },

  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    return ApiClient.delete(`${ADMIN_USERS_PREFIX}/${userId}`);
  },

  async restoreUser(userId: string): Promise<RestoreUserResponse> {
    return ApiClient.patch(`${ADMIN_USERS_PREFIX}/${userId}/restore`, {});
  },
};
