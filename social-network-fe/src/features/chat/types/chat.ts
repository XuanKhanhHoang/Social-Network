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
  mediaUrl?: string;
  createdAt: string;
  readBy: string[];
  isRecovered?: boolean;
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

export interface ChatMessage
  extends Omit<Message, 'content' | 'id' | 'encryptedContent'> {
  id: string;
  encryptedContent?: string;
  decryptedContent?: JSONContent | null;
  status: 'sending' | 'sent' | 'error';
}
