import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { MediaResponse } from 'src/share/dto/res/media-response';
import { PostStatus, PostVisibility } from 'src/share/enums';

export interface CreatePostResponse {
  author: string;
  content: JSON;
  backgroundValue: string;
  media: MediaResponse[];
  visibility: PostVisibility;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: any[];
  hashtags: any[];
  status: PostStatus;
  reactionsBreakdown: ReactionsBreakdown;
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
