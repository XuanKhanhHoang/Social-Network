export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserListItem {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface UserDetail extends UserListItem {
  coverPhoto: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  bio: string;
  gender: string;
  birthDate: string;
  phoneNumber: string;
  work: string;
  currentLocation: string;
  provinceCode: string;
  friendCount: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  isVerified?: boolean;
  isDeleted?: boolean;
}

export interface GetUsersResponse {
  data: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  isVerified?: boolean;
  password?: string;
}

export interface UpdateUserResponse {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isVerified: boolean;
}

export interface LockUserResponse {
  _id: string;
  status: UserStatus;
}

export interface DeleteUserResponse {
  _id: string;
  deletedAt: string;
}

export interface RestoreUserResponse {
  _id: string;
  deletedAt: null;
}
