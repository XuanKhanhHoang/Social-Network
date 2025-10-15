import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionTargetType, ReactionType } from 'src/share/enums';

@Schema({ timestamps: true })
export class Reaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, enum: ReactionTargetType, required: true })
  targetType: string;

  @Prop({ type: String, enum: ReactionType, required: true })
  reactionType: ReactionType;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
ReactionSchema.index({ targetId: 1, targetType: 1, user: 1 });
