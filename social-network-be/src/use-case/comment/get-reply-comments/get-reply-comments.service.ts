import { Injectable } from '@nestjs/common';
import { ReplyCursorData } from 'src/comment/comment.type';
import { CommentService } from 'src/domains/comment/comment.service';
import { ReplyComment } from 'src/domains/comment/interfaces/comment.type';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetReplyCommentsInput = {
  commentId: string;
  userId: string;
  cursor?: string;
  limit?: number;
};
export type GetReplyCommentsOutput = BeCursorPaginated<ReplyComment>;
@Injectable()
export class GetReplyCommentsService extends BaseUseCaseService<
  GetReplyCommentsInput,
  GetReplyCommentsOutput
> {
  constructor(private readonly commentService: CommentService) {
    super();
  }
  async execute(input: GetReplyCommentsInput): Promise<GetReplyCommentsOutput> {
    const limit = input.limit || 10;

    const decodedCursor = input.cursor
      ? this.commentService.decodeCursorSafely<ReplyCursorData>(input.cursor)
      : undefined;
    const { replies, hasMore, nextCursor } =
      await this.commentService.getCommentReplies(
        input.commentId,
        input.userId,
        limit,
        decodedCursor,
      );
    return {
      data: replies,
      pagination: { nextCursor, hasMore },
    };
  }
}
