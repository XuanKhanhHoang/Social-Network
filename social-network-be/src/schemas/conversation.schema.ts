import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDocument } from './user.schema';
import { MessageDocument } from './message.schema';

@Schema({ timestamps: true, collection: 'conversations' })
export class ConversationDocument extends Document {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    index: true,
  })
  participants: UserDocument[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  })
  lastMessage: MessageDocument;

  @Prop({ type: Date, index: true, default: Date.now })
  lastInteractiveAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationDocument);
