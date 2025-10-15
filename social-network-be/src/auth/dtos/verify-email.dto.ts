export type VerifyEmailResponseDto = {
  message: string;
  user: {
    id: unknown;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
  };
};
