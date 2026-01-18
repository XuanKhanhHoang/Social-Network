import { Types } from 'mongoose';
import { MessageType } from 'src/schemas/message.schema';

export interface SearchConversationsWithPaginationResults {
  _id: Types.ObjectId;
  type?: 'private' | 'group';
  name?: string;
  avatar?: string;
  createdBy?: Types.ObjectId;
  participants: {
    user: {
      _id: Types.ObjectId;
      firstName: string;
      lastName: string;
      username: string;
      avatar: any;
      publicKey: string;
    };
    joinedAt: Date;
  }[];
  lastMessage?: {
    _id: Types.ObjectId;
    sender: {
      _id: Types.ObjectId;
      firstName: string;
      lastName: string;
      username: string;
      avatar: any;
    };
    type: MessageType;
    content?: string;
    nonce?: string;
    mediaUrl?: string;
    mediaNonce?: string;
    // Group E2EE fields
    encryptedContents?: Record<string, string>;
    encryptedFileKeys?: Record<string, string>;
    keyNonce?: string;
    readBy: Types.ObjectId[];
    createdAt: Date;
  };
  lastInteractiveAt: Date;
  hasRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

