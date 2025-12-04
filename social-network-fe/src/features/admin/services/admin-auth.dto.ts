export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminLoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
