import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserDocument } from './user.schema';

@Schema({ timestamps: true, collection: 'email_verifications' })
export class EmailVerificationDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: UserDocument.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({
    type: String,
    enum: ['registration', 'email_change'],
    default: 'registration',
  })
  type: string;
}

export const EmailVerificationSchema = SchemaFactory.createForClass(
  EmailVerificationDocument,
);
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
