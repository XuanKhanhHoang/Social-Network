import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Comment,
  CommentCursorData,
  CommentWithMedia,
  CreateCommentData,
  ReplyCursorData,
} from './interfaces/comment.type';
import { CommentRepository } from './comment-repository.service';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { ClientSession, UpdateQuery } from 'mongoose';
import { UpdateCommentData } from 'src/comment/comment.type';
import { CommentDocument } from 'src/schemas';

@Injectable()
export class CommentService {
  constructor(
    private readonly logger = new Logger(CommentService.name),
    private commentRepository: CommentRepository,
  ) {}

  async getTopCommentsForPosts(
    postIds: string[],
    userId: string,
  ): Promise<Map<string, CommentWithMedia>> {
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
    decodedCursorData?: CommentCursorData,
  ): Promise<{
    comments: CommentWithMedia[];
    hasMore: boolean;
    nextCursor: string | null;
  }> {
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
      comments: results,
      nextCursor,
      hasMore,
    };
  }
  async getCommentReplies(
    commentId: string,
    userId: string,
    limit: number,
    decodedCursorData?: ReplyCursorData,
  ) {
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
      replies: results,
      nextCursor,
      hasMore,
    };
  }

  async createComment(
    data: CreateCommentData,
    session?: ClientSession,
  ): Promise<Comment> {
    return (
      await this.commentRepository.create(data, session)
    ).toJSON() as Comment;
  }
  async updateComment(
    data: UpdateCommentData,
    session?: ClientSession,
  ): Promise<Comment> {
    const updateData: UpdateQuery<CommentDocument> = {};

    if (data.content !== undefined) {
      updateData.$set.content = data.content;
    }
    if (data.mediaId !== undefined) {
      updateData.$set.mediaId = data.mediaId;
    }

    const updatedPost = await this.commentRepository.updateByIdAndGet(
      data.commentId,
      updateData,
      session,
    );

    if (!updatedPost) {
      throw new NotFoundException('Comment not found');
    }

    return updatedPost.toObject() as Comment;
  }

  async validateOwnershipAndReturnWithMedia(
    commentId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<CommentWithMedia> {
    const comment = await this.commentRepository.findByIdWithMedia(
      commentId,
      session,
    );

    if (!comment) {
      throw new NotFoundException('Post not found');
    }

    if (comment.author._id !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    return comment;
  }
  decodeCursorSafely<T extends CommentCursorData | ReplyCursorData>(
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
