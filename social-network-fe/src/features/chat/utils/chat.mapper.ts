import {
  SuggestedMessagingUserDto,
  SuggestedMessagingUsersResponseDto,
} from '../types/chat.dto';
import {
  SuggestedMessagingUser,
  SuggestedMessagingUsersResponse,
} from '../types/chat';

export const mapSuggestedUserDtoToDomain = (
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

export const mapSuggestedUsersResponseDtoToDomain = (
  dto: SuggestedMessagingUsersResponseDto
): SuggestedMessagingUsersResponse => {
  return {
    data: dto.data.map(mapSuggestedUserDtoToDomain),
    nextCursor: dto.pagination.nextCursor,
  };
};
