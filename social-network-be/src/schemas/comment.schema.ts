import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionType } from 'src/share/enums';
import { PostDocument } from './post.schema';
import { UserDocument } from './user.schema';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { ReactionDocument } from './reaction.schema';
import { SubUser } from './sub-user.schema';
import { SubCommentMedia } from './sub-comment-media.schema';

@Schema({ timestamps: true, collection: 'comments' })
export class CommentDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: PostDocument.name,
    required: true,
    index: true,
  })
  postId: Types.ObjectId;

  @Prop({ type: SubUser, required: true })
  author: SubUser;

  @Prop({ type: Object })
  content: TiptapDocument;

  @Prop({ type: SubCommentMedia })
  media?: SubCommentMedia;

  @Prop({ type: Types.ObjectId, ref: CommentDocument.name, index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: SubUser, ref: UserDocument.name })
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
