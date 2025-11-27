import {
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserSummaryWithEmailDto,
  VerifyEmailResponseDto,
} from '@/lib/dtos';
import { ApiClient } from './api';
import { RequestOptions } from './type';

const AUTH_PREFIX = '/auth';
const USER_PREFIX = '/users';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponseDto> {
    return ApiClient.post(`${AUTH_PREFIX}/login`, { email, password });
  },

  async register(userData: RegisterRequestDto): Promise<RegisterResponseDto> {
    return ApiClient.post(`${AUTH_PREFIX}/register`, userData);
  },

  async logout() {
    const result = await ApiClient.post(`${AUTH_PREFIX}/logout`);
    window.location.href = '/login';
    return result;
  },
  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    return ApiClient.post(`${AUTH_PREFIX}/verify-email`, {
      token,
    });
  },
  async verifyUser(options?: RequestOptions): Promise<UserSummaryWithEmailDto> {
    return ApiClient.get(`${USER_PREFIX}/me`, options);
  },
  async checkSession(options?: RequestOptions): Promise<void> {
    return ApiClient.checkSession(options);
  },
};
