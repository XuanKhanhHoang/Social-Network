import { UserSummaryDto } from '@/lib/dtos';

export interface CursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface SuggestedMessagingUserResponseDto {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: {
    url: string;
    type: string;
  };
  isOnline: boolean;
  lastInteractiveAt: string;
  score: number;
}

export type SuggestedMessagingUsersResponseDto =
  CursorPaginatedResponse<SuggestedMessagingUserResponseDto>;

export interface SendMessageRequestDto {
  receiverId: string;
  type: 'text' | 'image';
  content: string; // Encrypted Base64
  nonce: string; // Base64
  file?: Blob; // Encrypted Blob
}

export interface MessageResponseDto {
  _id: string;
  conversation: string;
  sender: UserSummaryDto;
  type: 'text' | 'image';
  content: string;
  nonce: string;
  encryptedContent: string;
  media?: {
    url: string;
    type: 'image' | 'video';
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponseDto {
  _id: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: MessageResponseDto;
  updatedAt: string;
}

export type MessagesResponseDto = CursorPaginatedResponse<MessageResponseDto>;
export type ConversationsResponseDto =
  CursorPaginatedResponse<ConversationResponseDto>;
