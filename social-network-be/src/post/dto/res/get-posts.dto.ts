import { Comment } from 'src/schemas';
import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { Author } from 'src/share/dto/res/author';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { MediaResponse } from 'src/share/dto/res/media-response';
import { PostStatus, PostVisibility, ReactionType } from 'src/share/enums';

export interface GetPostsResponse extends BeCursorPaginated<Post> {}

interface Post {
  _id: string;
  author: Author;
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
  createdAt: Date;
  updatedAt: Date;
  userReactionType: null | ReactionType;
  userComments: Comment[];
}
