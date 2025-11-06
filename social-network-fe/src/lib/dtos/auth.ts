import { Gender } from '../constants/enums';

export interface RegisterResponseDto {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    avatar?: string;
  };
}

export interface LoginResponseDto {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export interface VerifyEmailResponseDto {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
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
