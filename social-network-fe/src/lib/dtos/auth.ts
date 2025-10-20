import { Gender } from '@/lib/constants/enums';

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  username: string;
};
export type LoginResponseDto = {
  message: string;
  user: User;
};

export type VerifyEmailResponseDto = {
  message: string;
  user: User & { emailVerified: boolean };
};
export type RegisterDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
};
