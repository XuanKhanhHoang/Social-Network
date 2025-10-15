// src/comments/schemas/comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionType } from 'src/share/enums';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true, index: true })
  post: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Object })
  content: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'MediaUpload' })
  mediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: String, enum: ReactionType })
  reactionType?: ReactionType;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  mentionedUser?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  reactionsCount: number;

  @Prop({ type: Number, default: 0 })
  repliesCount: number;

  @Prop({
    type: Map,
    of: Number,
    default: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
    ref: 'Reaction',
  })
  reactionsBreakdown: Record<ReactionType, number>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
