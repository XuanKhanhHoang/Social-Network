import { Gender } from '../constants/enums';
import { UserSummaryDto } from './user';

export type UserSummaryAuth = UserSummaryDto & { email: string };

export interface RegisterResponseDto {
  message: string;
  user: UserSummaryAuth;
}

export interface LoginResponseDto {
  message: string;
  user: UserSummaryAuth;
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
}
