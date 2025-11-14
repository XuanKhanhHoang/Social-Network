import { Types } from 'mongoose';
import { Comment } from 'src/domains/comment/interfaces/comment.type';
import { MediaBasicDataWithCaption } from 'src/domains/media-upload/interfaces/type';
import { UserBasicData } from 'src/domains/user/interfaces';
import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { Author } from 'src/share/dto/res/author';
import { PostStatus, ReactionType, UserPrivacy } from 'src/share/enums';
export interface PostCursorData {
  lastHotScore: number;
  lastId: string;
}

export interface Post {
  _id: string;
  author: Author;
  content: JSON;
  backgroundValue: string;
  media: MediaBasicDataWithCaption<string>[];
  visibility: UserPrivacy;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: any[];
  hashtags: any[];
  status: PostStatus;
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: Date;
  updatedAt: Date;
  hotScore: number;
}
export interface PostWithMyReaction extends Post {
  myReaction: ReactionType | null;
}
export interface PostWithTopCommentAndUserReaction extends PostWithMyReaction {
  topComment: Comment;
}
export interface CreatePostData {
  author: UserBasicData;
  media: MediaBasicDataWithCaption<string>[];
  content: TiptapDocument;
  backgroundValue?: string;
  visibility?: UserPrivacy;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  postId: string;
}

export interface PhotoPreview {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  caption: string;
  order: number;
  url: string;
  mediaType: string;
}
export interface PaginatedPhotos {
  photos: PhotoPreview[];
  nextCursor: number | null;
}
