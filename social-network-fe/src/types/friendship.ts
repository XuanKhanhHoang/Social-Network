import { FriendshipDto } from '@/lib/dtos/friendship';

export interface Friendship {
  id: string;
  requester: string;
  recipient: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export function mapFriendshipDtoToDomain(dto: FriendshipDto): Friendship {
  return {
    id: dto._id,
    requester: dto.requester,
    recipient: dto.recipient,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
