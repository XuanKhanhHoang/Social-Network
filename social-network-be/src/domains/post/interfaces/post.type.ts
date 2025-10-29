import { Types } from 'mongoose';
import { CommentWithMedia } from 'src/domains/comment/interfaces/comment.type';
import { Media } from 'src/media-upload/interfaces/type';
import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { Author } from 'src/share/dto/res/author';
import { PostStatus, ReactionType, UserPrivacy } from 'src/share/enums';
export interface PostCursorData {
  lastHotScore: number;
  lastId: string;
}

export interface PostMedia {
  mediaId: string;
  caption?: string;
  order: number;
}
export interface Post {
  _id: string;
  author: Author;
  content: JSON;
  backgroundValue: string;
  media: PostMedia[];
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
  userReactionType?: null | ReactionType;
  hotScore: number;
}
export interface PostWithMedia extends Omit<Post, 'media'> {
  media: Media[];
}
export interface PostWithTopComment extends PostWithMedia {
  topComment: CommentWithMedia;
}
export interface CreatePostData {
  author: string;
  media: {
    mediaId: string;
    caption?: string;
    order: number;
  }[];
  content: TiptapDocument;
  backgroundValue?: string;
  visibility?: UserPrivacy;
}
export interface UpdatePostInput
  extends Partial<Omit<CreatePostData, 'author'>> {
  userId: string;
  postId: string;
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
  originalFilename: string;
  mediaType: string;
}
export interface PaginatedPhotos {
  photos: PhotoPreview[];
  hasNextPage: boolean;
}
