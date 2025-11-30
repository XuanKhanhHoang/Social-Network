import { SuggestedMessagingUserDto } from './chat.dto';

export interface SuggestedMessagingUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastInteractiveAt: Date;
  score: number;
}

export interface SuggestedMessagingUsersResponse {
  data: SuggestedMessagingUser[];
  nextCursor?: string;
}

export const mapSuggestedMessagingUserDtoToDomain = (
  dto: SuggestedMessagingUserDto
): SuggestedMessagingUser => {
  return {
    id: dto._id,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    username: dto.username,
    avatar: dto.avatar?.url || '',
    isOnline: dto.isOnline,
    lastInteractiveAt: new Date(dto.lastInteractiveAt),
    score: dto.score,
  };
};
