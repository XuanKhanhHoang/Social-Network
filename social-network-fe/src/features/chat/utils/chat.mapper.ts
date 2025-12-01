import {
  SuggestedMessagingUserResponseDto,
  SuggestedMessagingUsersResponseDto,
  MessageResponseDto,
  ConversationResponseDto,
} from '../services/chat.dto';
import {
  SuggestedMessagingUser,
  SuggestedMessagingUsersResponse,
  Message,
  Conversation,
} from '../types/chat';

export const mapSuggestedUserDtoToDomain = (
  dto: SuggestedMessagingUserResponseDto
): SuggestedMessagingUser => {
  return {
    id: dto._id,
    name: `${dto.lastName} ${dto.firstName}`,
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

export const mapMessageDtoToDomain = (dto: MessageResponseDto): Message => {
  return {
    id: dto._id,
    conversationId: dto.conversation,
    sender: dto.sender,
    type: dto.type,
    content: dto.content,
    nonce: dto.nonce,
    mediaUrl: dto.mediaUrl,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

export const mapConversationDtoToDomain = (
  dto: ConversationResponseDto
): Conversation => {
  return {
    id: dto._id,
    participants: dto.participants.map((p) => ({
      id: p._id,
      firstName: p.firstName,
      lastName: p.lastName,
      avatar: p.avatar,
    })),
    lastMessage: dto.lastMessage
      ? mapMessageDtoToDomain(dto.lastMessage)
      : undefined,
    updatedAt: dto.updatedAt,
  };
};
