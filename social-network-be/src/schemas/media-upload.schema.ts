import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaType } from 'src/share/enums';
import { UserDocument } from './user.schema';

@Schema({
  timestamps: true,
  collection: 'media_uploads',
})
export class MediaUploadDocument extends Document {
  @Prop({ required: true })
  cloudinaryPublicId: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true, enum: MediaType })
  mediaType: string;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ required: true, ref: UserDocument.name })
  userId: string;

  @Prop({ type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000) })
  expiresAt?: Date;
}
export const MediaUploadSchema =
  SchemaFactory.createForClass(MediaUploadDocument);
MediaUploadSchema.index({ userId: 1, isConfirmed: 1 });
