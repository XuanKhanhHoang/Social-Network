// src/posts/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserPrivacy, ReactionType } from 'src/share/enums';
import { PostStatus } from 'src/share/enums';
import { PostMedia } from './post-media.schema';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Object, required: true })
  content: Record<string, any>;

  @Prop({ type: String })
  backgroundValue?: string;

  @Prop({ type: [PostMedia] })
  media?: PostMedia[];

  @Prop({ type: String, enum: UserPrivacy, default: UserPrivacy.PUBLIC })
  visibility: string;

  @Prop({ type: Number, default: 0 })
  reactionsCount: number;

  @Prop({ type: Number, default: 0 })
  commentsCount: number;

  @Prop({ type: Number, default: 0 })
  sharesCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  tags: Types.ObjectId[];

  @Prop({ type: [String] })
  hashtags: string[];

  @Prop({ type: String })
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  parentPost?: Types.ObjectId;

  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.ACTIVE,
  })
  status: string;

  @Prop({
    type: Map,
    of: Number,
    default: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
  })
  reactionsBreakdown: Record<ReactionType, number>;

  @Prop({ type: Number, default: 0, index: true })
  hotScore: number;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
