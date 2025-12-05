import { ApiClient } from '@/services/api';
import { AdminLoginDto, AdminLoginResponseDto } from './auth.dto';

const ADMIN_AUTH_PREFIX = '/admin/auth';

export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const adminAuthService = {
  async login(data: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return ApiClient.post(`${ADMIN_AUTH_PREFIX}/login`, data);
  },

  async verify(): Promise<AdminUser> {
    return ApiClient.get(`${ADMIN_AUTH_PREFIX}/verify`);
  },

  async logout() {
    window.location.href = '/admin/login';
  },
};
