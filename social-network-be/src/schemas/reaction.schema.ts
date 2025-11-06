import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionTargetType, ReactionType } from 'src/share/enums';
import { UserDocument } from './user.schema';

@Schema({ timestamps: true, collection: 'reactions' })
export class ReactionDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: UserDocument.name, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, enum: ReactionTargetType, required: true })
  targetType: string;

  @Prop({ type: String, enum: ReactionType, required: true })
  reactionType: ReactionType;
}
export const ReactionSchema = SchemaFactory.createForClass(ReactionDocument);
ReactionSchema.index({ targetId: 1, targetType: 1, user: 1 });
