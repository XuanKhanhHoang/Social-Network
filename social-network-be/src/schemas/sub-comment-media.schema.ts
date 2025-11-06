import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MediaUploadDocument } from './media-upload.schema';
import { MediaType } from 'src/share/enums';

@Schema({ _id: false })
export class SubCommentMedia {
  @Prop({ type: Types.ObjectId, ref: MediaUploadDocument.name, required: true })
  mediaId: Types.ObjectId;

  @Prop({ type: String, enum: MediaType, default: MediaType.IMAGE })
  mediaType: MediaType;

  @Prop({ type: String, required: true })
  url: string;
}
