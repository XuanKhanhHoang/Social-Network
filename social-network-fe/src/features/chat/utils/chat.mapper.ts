import {
  SuggestedMessagingUserResponseDto,
  SuggestedMessagingUsersResponseDto,
  MessageResponseDto,
  ConversationResponseDto,
  ConversationItemInSearchConversationResponseDto,
} from '../services/chat.dto';
import {
  SuggestedMessagingUser,
  SuggestedMessagingUsersResponse,
  Message,
  Conversation,
  SearchConversation,
} from '../types/chat';

export const mapSearchConversationDtoToDomain = (
  dto: ConversationItemInSearchConversationResponseDto
): SearchConversation => {
  return {
    id: dto._id,
    participants: dto.participants.map((p) => ({
      id: p._id,
      firstName: p.firstName,
      lastName: p.lastName,
      username: p.username,
      avatar: p.avatar,
      publicKey: p.publicKey,
    })),
    lastMessage:
      dto.lastMessage && dto.lastMessage._id && dto.lastMessage.sender
        ? {
            id: dto.lastMessage._id,
            conversationId: dto._id,
            sender: {
              id: dto.lastMessage.sender._id,
              firstName: dto.lastMessage.sender.firstName,
              lastName: dto.lastMessage.sender.lastName,
              username: dto.lastMessage.sender.username,
              avatar: dto.lastMessage.sender.avatar,
            },
            type: dto.lastMessage.type,
            encryptedContent: dto.lastMessage.content,
            nonce: dto.lastMessage.nonce,
            mediaNonce: dto.lastMessage.mediaNonce,
            mediaUrl: dto.lastMessage.mediaUrl,
            readBy: dto.lastMessage.readBy,
            createdAt: dto.lastMessage.createdAt,
            isRecovered: dto.lastMessage.isRecovered || false,
          }
        : undefined,
    lastInteractiveAt: dto.lastInteractiveAt,
    hasRead: dto.hasRead,
    updatedAt: dto.updatedAt,
  };
};

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
export const mapSuggestedMessagingUserDtoToDomain = (
  dto: SuggestedMessagingUserResponseDto
): SuggestedMessagingUser => {
  return {
    id: dto._id,
    name: `${dto.lastName} ${dto.firstName}`.trim(),
    username: dto.username,
    avatar: dto.avatar?.url || '',
    isOnline: dto.isOnline,
    lastInteractiveAt: new Date(dto.lastInteractiveAt),
    score: dto.score,
  };
};
export const mapMessageDtoToDomain = (dto: MessageResponseDto): Message => {
  return {
    id: dto._id,
    conversationId: dto.conversationId,
    sender: {
      id: dto.sender._id,
      firstName: dto.sender.firstName,
      lastName: dto.sender.lastName,
      username: dto.sender.username,
      avatar: dto.sender.avatar,
    },
    type: dto.type,
    encryptedContent: dto?.content,
    nonce: dto?.nonce,
    mediaNonce: dto?.mediaNonce,
    mediaUrl: dto?.mediaUrl,
    readBy: dto?.readBy,
    isRecovered: dto?.isRecovered,
    createdAt: dto.createdAt,
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
