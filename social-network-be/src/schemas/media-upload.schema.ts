import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaType } from 'src/share/enums';

@Schema({
  timestamps: true,
})
export class MediaUploadDocument extends Document {
  @Prop({ required: true })
  cloudinaryPublicId: string;

  @Prop({ required: true })
  cloudinaryUrl: string;

  @Prop({ required: true })
  originalFilename: string;

  @Prop({ required: true, enum: MediaType })
  mediaType: string;

  @Prop({ default: false })
  isConfirmed: boolean;

  @Prop({ required: true })
  userId: string;

  @Prop({ type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000) })
  expiresAt?: Date;
}
export const MediaUploadSchema =
  SchemaFactory.createForClass(MediaUploadDocument);
MediaUploadSchema.index({ userId: 1, isConfirmed: 1 });
