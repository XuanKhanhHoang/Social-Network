import { JSONContent } from '@tiptap/react';
import { UserSummary } from '@/lib/interfaces';

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

export interface Message {
  id: string;
  conversationId: string;
  sender: UserSummary;
  type: 'text' | 'image';
  nonce?: string;
  mediaNonce?: string;
  encryptedContent?: string;
  // Group E2EE fields
  encryptedContents?: Record<string, string>;
  encryptedFileKeys?: Record<string, string>;
  keyNonce?: string;
  mediaUrl?: string;
  createdAt: string;
  readBy: string[];
  isRecovered?: boolean;
}

export interface Conversation {
  id: string;
  type?: 'private' | 'group';
  name?: string;
  avatar?: string;
  createdBy?: string;
  owner?: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface ChatMessage
  extends Omit<Message, 'content' | 'id' | 'encryptedContent'> {
  id: string;
  encryptedContent?: string;
  encryptedContents?: Record<string, string>;
  encryptedFileKeys?: Record<string, string>;
  keyNonce?: string;
  decryptedContent?: JSONContent | null;
  status: 'sending' | 'sent' | 'error';
}

// Group participant with user info and joinedAt
export interface GroupParticipant {
  user: {
    id: string;
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

export interface SearchConversation {
  id: string;
  type?: 'private' | 'group';
  name?: string;
  avatar?: string;
  createdBy?: string;
  owner?: string;
  participants: (
    | {
        // Legacy 1-1 format (populated user)
        id: string;
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
    | GroupParticipant
  )[];
  lastMessage?: {
    id: string;
    conversationId: string;
    sender: {
      id: string;
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
    isRecovered: boolean;
    type: 'text' | 'image';
    encryptedContent?: string;
    encryptedContents?: Record<string, string>;
    encryptedFileKeys?: Record<string, string>;
    keyNonce?: string;
    nonce?: string;
    mediaNonce?: string;
    mediaUrl?: string;
    readBy: string[];
    createdAt: string;
  };
  lastInteractiveAt: string;
  hasRead: boolean;
  updatedAt: string;
}

// Group member info for display
export interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: { url: string };
  publicKey: string;
  joinedAt: string;
}
