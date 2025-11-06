import { Injectable, Logger } from '@nestjs/common';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import {
  ReplyComment,
  ReplyCursorData,
} from 'src/domains/comment/interfaces/comment.type';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
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
  constructor(private readonly commentRepository: CommentRepository) {
    super();
  }
  private readonly logger = new Logger(GetReplyCommentsService.name);
  async execute(input: GetReplyCommentsInput): Promise<GetReplyCommentsOutput> {
    const { commentId, limit = 10, userId, cursor } = input;

    const decodedCursorData = cursor
      ? this.decodeCursorSafely<ReplyCursorData>(cursor)
      : undefined;

    const replies = await this.commentRepository.getCommentReplies(
      commentId,
      userId,
      limit,
      decodedCursorData,
    );

    let nextCursor: string | null = null;
    let hasMore = false;

    if (replies.length > limit) {
      hasMore = true;
      const lastReply = replies[limit - 1];

      const cursorData: ReplyCursorData = {
        lastPriority: lastReply.priority,
        lastId: lastReply._id.toString(),
      };
      nextCursor = encodeCursor(cursorData);
    }

    const results = replies.slice(0, limit);

    return {
      data: results,
      pagination: { nextCursor, hasMore },
    };
  }
  decodeCursorSafely<T extends ReplyCursorData>(cursor: string): T | undefined {
    try {
      return decodeCursor<T>(cursor);
    } catch (error) {
      this.logger.warn(`Invalid cursor format: ${cursor}`);
      return undefined;
    }
  }
}
