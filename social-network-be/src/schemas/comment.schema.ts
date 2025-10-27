import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionType } from 'src/share/enums';

@Schema({ timestamps: true })
export class CommentDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Object })
  content: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'MediaUpload' })
  mediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  mentionedUser?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  reactionsCount: number;

  @Prop({ type: Number, default: 0 })
  repliesCount: number;

  @Prop({ type: Number, default: 0 })
  engagementScore: number;

  @Prop({
    type: Map,
    of: Number,
    default: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
    ref: 'Reaction',
  })
  reactionsBreakdown: Record<ReactionType, number>;

  createAt: Date;
  updateAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(CommentDocument);
