import { Types } from 'mongoose';
import { CommentWithMyReactionModel } from 'src/domains/comment/interfaces';
import { PostDocument } from 'src/schemas';

export type PostModel<T extends string | Types.ObjectId> = Omit<
  PostDocument,
  '_id'
> & {
  _id: T;
};
export type PostWithMyReactionModel<T extends string | Types.ObjectId> =
  PostModel<T> & {
    myReaction: string | null;
  };

export type PostWithTopCommentAndUserReactionModel<
  T extends string | Types.ObjectId,
  U extends string | Types.ObjectId = string,
> = PostWithMyReactionModel<Types.ObjectId> & {
  topComment: CommentWithMyReactionModel<T, U> | null;
};
