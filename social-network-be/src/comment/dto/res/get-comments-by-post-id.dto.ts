import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { Author } from 'src/share/dto/res/author';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { MediaResponse } from 'src/share/dto/res/media-response';
import { ReactionType } from 'src/share/enums';

export interface GetCommentsByPostIdResponse
  extends BeCursorPaginated<Comment> {}

export interface Comment {
  _id: string;
  author: Author;
  content: JSON;
  reactionsCount: number;
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: Date;
  priority: number;
  engagementScore: null;
  media: MediaResponse[];
  mentionedUser: Author | null;
  myReaction: ReactionType | null;
}
