import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FriendshipStatus } from 'src/share/enums/friendship-status';

@Schema({
  timestamps: true,
  collection: 'friendships',
})
export class FriendshipDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  requester: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipient: Types.ObjectId;

  @Prop({
    type: String,
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
    index: true,
  })
  status: FriendshipStatus;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  blockedBy?: Types.ObjectId;
}

export const FriendshipSchema =
  SchemaFactory.createForClass(FriendshipDocument);
FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
