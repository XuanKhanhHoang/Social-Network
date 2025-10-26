import { RelationshipType } from 'src/user/interfaces/relationship.type';

// Đặt ở file DTO

export class UserHeaderResponseDto {
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  coverPhoto: string;
  relationship: RelationshipType;
}

export class UserBioResponseDto {
  bio: string;
  work?: string;
  currentLocation?: string;
}

export class FriendsPreviewResponseDto {
  total: number;
  friends: any[]; // Kiểu User DTO rút gọn
}

// Type nội bộ cho hàm helper
