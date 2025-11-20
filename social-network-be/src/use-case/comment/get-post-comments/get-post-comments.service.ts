import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import {
  CommentCursorData,
  CommentWithMyReactionAndPriorityModel,
} from 'src/domains/comment/interfaces';

import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetPostCommentsInput = {
  postId: string;
  userId: string;
  limit?: number;
  cursor?: string;
};
export type GetPostCommentsOutput = BeCursorPaginated<
  CommentWithMyReactionAndPriorityModel<Types.ObjectId, string>
>;
@Injectable()
export class GetPostCommentsService
  implements BaseUseCaseService<GetPostCommentsInput, GetPostCommentsOutput>
{
  constructor(private readonly commentRepository: CommentRepository) {}
  private readonly logger = new Logger(GetPostCommentsService.name);
  async execute(input: GetPostCommentsInput): Promise<GetPostCommentsOutput> {
    const { postId, userId, cursor, limit = 10 } = input;

    const decodedCursorData = cursor
      ? this.decodeCursorSafely<CommentCursorData>(cursor)
      : undefined;
    const comments = await this.commentRepository.findByPostIdWithCursor(
      postId,
      userId,
      limit,
      decodedCursorData,
    );

    let nextCursor: string | null = null;
    let hasMore = false;

    if (comments.length > limit) {
      hasMore = true;
      const lastComment = comments[limit - 1];
      const cursorData: CommentCursorData = {
        lastPriority: lastComment.priority,
        lastScore: lastComment.engagementScore,
        lastId: lastComment._id.toString(),
      };
      nextCursor = encodeCursor(cursorData);
    }

    const results = comments.slice(0, limit);

    return {
      data: results,
      pagination: { nextCursor, hasMore },
    };
  }
  private decodeCursorSafely<T extends CommentCursorData>(
    cursor: string,
  ): T | undefined {
    try {
      return decodeCursor<T>(cursor);
    } catch (error) {
      this.logger.warn(`Invalid cursor format: ${cursor}`);
      return undefined;
    }
  }
}
