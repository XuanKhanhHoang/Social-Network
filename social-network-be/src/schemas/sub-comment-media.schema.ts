import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MediaType } from 'src/share/enums';

@Schema({ _id: false })
export class SubMedia {
  @Prop({ type: Types.ObjectId, ref: 'MediaUpload', required: true })
  mediaId: Types.ObjectId;

  @Prop({ type: String, enum: MediaType, default: MediaType.IMAGE })
  mediaType: MediaType;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;
}
