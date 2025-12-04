import { Types } from 'mongoose';
import { CommentDocument } from 'src/schemas';

export type CommentModel<
  T extends string | Types.ObjectId,
  U extends string | Types.ObjectId,
> = Omit<CommentDocument, '_id' | 'postId'> & {
  _id: T;
  postId: U;
};
export type CommentWithMyReactionModel<
  T extends string | Types.ObjectId,
  U extends string | Types.ObjectId,
> = CommentModel<T, U> & {
  myReaction: string | null;
  replyToUser?: {
    _id: Types.ObjectId;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

export type CommentWithMyReactionAndPriorityModel<
  T extends string | Types.ObjectId,
  U extends string | Types.ObjectId,
> = CommentWithMyReactionModel<T, U> & {
  priority: number;
};
