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
  receiverId?: string; // For 1-1
  conversationId?: string; // For group
  type: 'text' | 'image';
  content?: string; // Encrypted Base64 (1-1)
  nonce?: string; // Base64
  mediaNonce?: string; // Base64 for media
  file?: Blob; // Encrypted Blob
  encryptedContents?: Record<string, string>;
  encryptedFileKeys?: Record<string, string>;
  keyNonce?: string;
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
  encryptedContents?: Record<string, string>;
  encryptedFileKeys?: Record<string, string>;
  keyNonce?: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  isRecovered?: boolean;

  status?: 'sent' | 'error' | 'sending';

  // Socket event extra fields
  conversationType?: 'private' | 'group';
  conversationName?: string;
  conversationAvatar?: string;
  conversationCreatedBy?: string;
  conversationOwner?: string;
}

export interface ConversationResponseDto {
  _id: string;
  type?: 'private' | 'group';
  name?: string;
  avatar?: string;
  createdBy?: string;
  owner?: string;
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

export interface GroupParticipantDto {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: {
      url: string;
      width?: number;
      height?: number;
      mediaId?: string;
    };
    publicKey: string;
  };
  joinedAt: string;
}

export interface ConversationItemInSearchConversationResponseDto {
  _id: string;
  type?: 'private' | 'group';
  name?: string;
  avatar?: string;
  createdBy?: string;
  owner?: string;
  participants: (
    | {
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
      }
    | GroupParticipantDto
  )[];
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
    // Group E2EE fields
    encryptedContents?: Record<string, string>;
    encryptedFileKeys?: Record<string, string>;
    keyNonce?: string;
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

export interface CreateGroupRequestDto {
  name: string;
  memberIds: string[];
  avatar?: string;
}

export interface UpdateGroupRequestDto {
  name?: string;
  avatar?: string;
}

export interface AddGroupMemberRequestDto {
  memberIds: string[];
}

export interface GroupMemberDto {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: { url: string };
  publicKey: string;
  joinedAt: string;
}

export interface GroupMembersResponseDto {
  members: GroupMemberDto[];
  createdBy: string;
  owner?: string;
}

export interface GroupConversationResponseDto {
  _id: string;
  type: 'group';
  name: string;
  avatar?: string;
  createdBy: string;
  owner?: string;
  participants: GroupParticipantDto[];
  lastMessage?: MessageResponseDto;
  lastInteractiveAt: string;
  createdAt: string;
  updatedAt: string;
}
