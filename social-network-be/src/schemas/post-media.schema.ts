import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: true })
export class PostMedia {
  @Prop({ type: Types.ObjectId, ref: 'MediaUpload', required: true })
  mediaId: Types.ObjectId;

  @Prop({ type: String })
  caption?: string;

  @Prop({ type: Number, default: 0 })
  order: number;
}
