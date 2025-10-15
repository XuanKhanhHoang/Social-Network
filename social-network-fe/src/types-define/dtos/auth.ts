import { Gender } from '@/lib/constants/enums';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};
export type LoginResponseDto = {
  message: string;
  user: User;
};

export type VerifyEmailResponseDto = {
  message: string;
  user: {
    _id: unknown;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
  };
};
export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
};
