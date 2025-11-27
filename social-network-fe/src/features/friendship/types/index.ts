import { FriendshipDto } from '@/lib/dtos/friendship';
import { transformToUserSummary, UserSummary } from '@/lib/interfaces';

export interface Friendship {
  id: string;
  requester: UserSummary;
  recipient: UserSummary;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export function mapFriendshipDtoToDomain(dto: FriendshipDto): Friendship {
  return {
    id: dto._id,
    requester: transformToUserSummary(dto.requester),
    recipient: transformToUserSummary(dto.recipient),
    status: dto.status as 'PENDING' | 'ACCEPTED' | 'BLOCKED',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
