import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

@Schema({ _id: false })
export class ParticipantInfo {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;
}

export const ParticipantInfoSchema =
  SchemaFactory.createForClass(ParticipantInfo);

@Schema({ timestamps: true, collection: 'conversations' })
export class ConversationDocument extends Document {
  @Prop({
    type: String,
    enum: ConversationType,
    default: ConversationType.PRIVATE,
  })
  type: ConversationType;

  @Prop({ type: String, default: null, maxlength: 100 })
  name: string;

  @Prop({ type: String, default: null })
  avatar: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  owner: Types.ObjectId;

  @Prop({ type: [ParticipantInfoSchema], index: true })
  participants: ParticipantInfo[];

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessage: Types.ObjectId;

  @Prop({ type: Date, index: true, default: Date.now })
  lastInteractiveAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationDocument);
