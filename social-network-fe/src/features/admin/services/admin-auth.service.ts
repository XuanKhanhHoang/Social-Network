import { ApiClient } from '@/services/api';
import { AdminLoginDto, AdminLoginResponseDto } from './admin-auth.dto';

const ADMIN_AUTH_PREFIX = '/admin/auth';

export const adminAuthService = {
  async login(data: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return ApiClient.post(`${ADMIN_AUTH_PREFIX}/login`, data);
  },

  async logout() {
    window.location.href = '/admin/login';
  },
};
