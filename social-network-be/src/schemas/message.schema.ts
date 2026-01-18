import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
}

@Schema({ timestamps: true, collection: 'messages' })
export class MessageDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sender: Types.ObjectId;

  @Prop({ type: String, enum: MessageType, required: true })
  type: MessageType;

  // === 1-1 Text E2EE ===
  @Prop({ type: String, default: null })
  content: string;

  @Prop({ type: String, default: null })
  nonce: string;

  // === 1-1 & Group Media ===
  @Prop({ type: String, default: null })
  mediaUrl: string;

  @Prop({ type: String, default: null })
  mediaNonce: string;

  // === Group Text E2EE (multi-encrypt) ===
  @Prop({ type: Object, default: null })
  encryptedContents: Record<string, string>; // { recipientId: encryptedText }

  // === Group Media E2EE (envelope encryption) ===
  @Prop({ type: Object, default: null })
  encryptedFileKeys: Record<string, string>; // { recipientId: wrappedCEK }

  @Prop({ type: String, default: null })
  keyNonce: string; // Nonce để decrypt wrapped CEK

  // === Common ===
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isRecovered: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);
