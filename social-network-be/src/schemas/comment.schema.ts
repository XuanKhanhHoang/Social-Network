import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionType } from 'src/share/enums';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { ReactionDocument } from './reaction.schema';
import { SubUser } from './sub-user.schema';
import { SubMedia } from './sub-comment-media.schema';

@Schema({ timestamps: true, collection: 'comments' })
export class CommentDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true,
  })
  postId: Types.ObjectId;

  @Prop({ type: SubUser, required: true })
  author: SubUser;

  @Prop({ type: Object })
  content: TiptapDocument;

  @Prop({ type: SubMedia })
  media?: SubMedia;

  @Prop({ type: Types.ObjectId, ref: 'Comment', index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', index: true })
  rootId?: Types.ObjectId;

  @Prop({ type: SubUser, ref: 'User' })
  mentionedUser?: SubUser;

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
    ref: ReactionDocument.name,
  })
  reactionsBreakdown: Record<ReactionType, number>;

  createAt: Date;
  updateAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(CommentDocument);
CommentSchema.index({ 'author._id': 1 });
CommentSchema.index({ postId: 1, engagementScore: -1 });
