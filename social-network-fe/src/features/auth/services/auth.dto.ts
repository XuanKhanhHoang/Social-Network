import { Gender } from '@/lib/constants/enums';
import { UserSummaryDto } from '@/features/user/services/user.dto';

export type UserSummaryAuth = UserSummaryDto & { email: string };

export interface RegisterResponseDto {
  message: string;
  user: UserSummaryAuth;
}

export interface LoginResponseDto {
  message: string;
  user: UserSummaryAuth;
  keyVault: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
}
export interface GetMeResponseDto {
  keyVault: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
  _id: string;
  username: string;
  avatar?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  firstName: string;
  lastName: string;
  email: string;
}

export interface VerifyEmailResponseDto {
  message: string;
  user: UserSummaryAuth & {
    emailVerified: boolean;
  };
}

export interface LogoutResponseDto {
  message: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
  publicKey: string;
  keyVault: {
    salt: string;
    iv: string;
    ciphertext: string;
  };
}

export interface ForgotPasswordResponseDto {
  message: string;
}
