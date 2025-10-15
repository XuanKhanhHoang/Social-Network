import {
  LoginResponseDto,
  RegisterDto,
  User,
  VerifyEmailResponseDto,
} from '@/types-define/dtos';
import { ApiClient } from './api';
import { RequestOptions } from '@/types-define/types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponseDto> {
    return ApiClient.post('/auth/login', { email, password });
  },

  async register(userData: RegisterDto) {
    return ApiClient.post('/auth/register', userData);
  },

  async logout() {
    const result = await ApiClient.post('/auth/logout');
    window.location.href = '/login';
    return result;
  },
  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    return ApiClient.post('/auth/verify-email', {
      token,
    });
  },
  async verifyUser(options?: RequestOptions): Promise<User> {
    return ApiClient.get('/auth/me', options);
  },
};
