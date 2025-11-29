import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubUser } from './sub-user.schema';

@Schema({ timestamps: true, collection: 'notifications' })
export class NotificationDocument extends Document {
  @Prop({ type: SubUser, required: true })
  sender: SubUser;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Types.ObjectId, required: true, refPath: 'relatedModel' })
  relatedId: Types.ObjectId;

  @Prop({ type: String, required: true })
  relatedModel: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: String })
  message?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema =
  SchemaFactory.createForClass(NotificationDocument);

NotificationSchema.index({ receiver: 1, createdAt: -1 });
