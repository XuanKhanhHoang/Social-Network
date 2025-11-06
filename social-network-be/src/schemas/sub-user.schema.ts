import { Prop, Schema } from '@nestjs/mongoose';
import { UserDocument } from './user.schema';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class SubUser {
  @Prop({ type: Types.ObjectId, ref: UserDocument.name, required: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({})
  avatar?: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;
}
