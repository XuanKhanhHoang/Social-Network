import {
  GetMeResponseDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  VerifyEmailResponseDto,
  ForgotPasswordResponseDto,
} from './auth.dto';
import { ApiClient } from '@/services/api';
import { RequestOptions } from '@/services/type';

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
  async verifyUser(options?: RequestOptions): Promise<GetMeResponseDto> {
    return ApiClient.get(`${USER_PREFIX}/me`, options);
  },
  async checkSession(options?: RequestOptions): Promise<void> {
    return ApiClient.checkSession(options);
  },
  async forgotPassword(email: string): Promise<ForgotPasswordResponseDto> {
    return ApiClient.post(`${AUTH_PREFIX}/forgot-password`, { email });
  },
};
