import { JSONContent } from '@tiptap/react';
import {
  SendMessageRequestDto,
  SuggestedMessagingUserResponseDto,
} from '../services/chat.dto';

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
  nextCursor?: string | null;
}

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

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  type: 'text' | 'image';
  content: string; // Encrypted
  nonce: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  updatedAt: string;
}
export interface SendMessageVariables extends SendMessageRequestDto {
  tempId: string;
}

export interface ChatMessage extends Omit<Message, 'content' | 'id'> {
  id: string;
  content: JSONContent | null; // Decrypted content (for optimistic UI)
  encryptedContent?: string; // Encrypted content (from server)
  status: 'sending' | 'sent' | 'error';
  media?: {
    url: string;
    type: 'image' | 'video';
    encryptedBlob?: Blob;
  };
}
