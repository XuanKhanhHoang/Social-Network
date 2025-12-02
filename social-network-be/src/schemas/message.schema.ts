import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { UserDocument } from './user.schema';
import { ConversationDocument } from './conversation.schema';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
}

@Schema({ timestamps: true, collection: 'messages' })
export class MessageDocument extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  })
  conversationId: ConversationDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  sender: UserDocument;

  @Prop({ type: String, enum: MessageType, required: true })
  type: MessageType;

  @Prop({})
  content: string; // Encrypted Base64

  @Prop({})
  nonce: string; // Base64

  @Prop({ type: String, default: null })
  mediaUrl: string; // Cloudinary Raw URL

  @Prop({ type: String, default: null })
  mediaNonce: string; // Base64 for media encryption

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  readBy: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isRecovered: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);
