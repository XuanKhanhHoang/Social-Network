import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EmailVerificationDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
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
