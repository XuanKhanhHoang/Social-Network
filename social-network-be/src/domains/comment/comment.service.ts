import { Injectable } from '@nestjs/common';
import { TopCommentInPost } from './interfaces/comment.type';
import { CommentRepository } from './comment-repository.service';

@Injectable()
export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async getTopCommentsForPosts(
    postIds: string[],
    userId: string,
  ): Promise<Map<string, TopCommentInPost>> {
    if (!postIds || postIds.length === 0) {
      return new Map();
    }
    const topComments = await this.commentRepository.findTopCommentsForPosts(
      postIds,
      userId,
    );
    return new Map(topComments.map((comment) => [comment.postId, comment]));
  }
  async getPostComments(
    postId: string,
    userId: string,
    limit: number,
    cursor?: string,
  ): Promise<GetCommentsByPostIdResponse> {
    let decodedCursorData: CommentCursorData | undefined = undefined;
    if (cursor) {
      try {
        decodedCursorData = decodeCursor<CommentCursorData>(cursor);
      } catch (error) {
        this.logger.warn(
          `Invalid cursor format: ${cursor}. Falling back to first page.`,
          error,
        );
      }
    }

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
}
