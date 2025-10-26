import { AggregatedComment } from 'src/comment/comment.type';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';

export interface GetCommentsByPostIdResponse
  extends BeCursorPaginated<AggregatedComment> {}
