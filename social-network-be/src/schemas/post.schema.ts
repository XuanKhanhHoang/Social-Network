import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserPrivacy, ReactionType } from 'src/share/enums';
import { PostStatus } from 'src/share/enums';
import { SubUser } from './sub-user.schema';
import { SubPostMedia } from './sub-post-media.schema';

@Schema({ timestamps: true, collection: 'posts' })
export class PostDocument extends Document {
  @Prop({ type: SubUser, required: true })
  author: SubUser;

  @Prop({ type: Object, required: true })
  content: Record<string, any>;

  @Prop({ type: String })
  backgroundValue?: string;

  @Prop({ type: [SubPostMedia] })
  media?: SubPostMedia[];

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

export const PostSchema = SchemaFactory.createForClass(PostDocument);
PostSchema.index({ 'author._id': 1 });
PostSchema.index({ 'author._id': 1, status: 1, visibility: 1 });
PostSchema.index({ parentPost: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ hotScore: -1, _id: -1 });
