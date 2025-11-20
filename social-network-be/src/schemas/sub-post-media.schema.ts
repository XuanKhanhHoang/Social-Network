import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MediaType } from 'src/share/enums';

@Schema({ _id: true })
export class SubPostMedia {
  @Prop({ type: Types.ObjectId, ref: 'MediaUpload', required: true })
  mediaId: Types.ObjectId;

  @Prop({ type: String, enum: MediaType, default: MediaType.IMAGE })
  mediaType: MediaType;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String })
  caption?: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;

  @Prop({ type: Date })
  createdAt: Date;
}
