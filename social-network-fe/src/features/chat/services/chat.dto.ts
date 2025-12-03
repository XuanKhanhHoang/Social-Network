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
  content?: string; // Encrypted Base64
  nonce?: string; // Base64
  mediaNonce?: string; // Base64 for media
  file?: Blob; // Encrypted Blob
}

export interface MessageResponseDto {
  _id: string;
  conversationId: string;
  sender: UserSummaryDto;
  type: 'text' | 'image';
  content?: string;
  nonce?: string;
  mediaNonce?: string;
  encryptedContent: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  isRecovered?: boolean;

  status?: 'sent' | 'error' | 'sending';
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

export interface ConversationItemInSearchConversationResponseDto {
  _id: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: {
      url: string;
      width?: number;
      height?: number;
      mediaId?: string;
    };
    publicKey: string;
  }[];
  lastMessage?: {
    _id: string;
    sender: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
      avatar: {
        url: string;
        width?: number;
        height?: number;
        mediaId?: string;
      };
    };
    isRecovered?: boolean;
    type: 'text' | 'image';
    content?: string;
    nonce?: string;
    mediaUrl?: string;
    mediaNonce?: string;
    readBy: string[];
    createdAt: string;
  };
  lastInteractiveAt: string;
  hasRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SearchConversationsResponseDto =
  CursorPaginatedResponse<ConversationItemInSearchConversationResponseDto>;
