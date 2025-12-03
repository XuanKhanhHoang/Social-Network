import { Types } from 'mongoose';
import { MessageType } from 'src/schemas/message.schema';

export interface SearchConversationsWithPaginationResults {
  _id: Types.ObjectId;
  participants: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    username: string;
    avatar: any;
    publicKey: string;
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
    readBy: Types.ObjectId[];
    createdAt: Date;
  };
  lastInteractiveAt: Date;
  hasRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
