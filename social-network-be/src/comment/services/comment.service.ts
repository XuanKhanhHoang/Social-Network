import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { Comment } from 'src/schemas';
import { CreateCommentDto, UpdateCommentDto } from '../dto/req';
import { MediaUploadService } from 'src/media-upload/media-upload.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateCommentResponse,
  GetCommentsByPostIdResponse,
  UpdateCommentResponse,
} from '../dto/res';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import {
  CommentCursorData,
  CreateCommentData,
  ReplyCursorData,
  UpdateCommentData,
} from '../comment.type';
import { MediaType } from 'src/share/enums';
import { CommentRepository } from './comment-repository.service';
import { PostRepository } from 'src/post/services/post-repository.service';
import { CommentEvents } from 'src/share/events';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private mediaUploadService: MediaUploadService,
    private eventEmitter: EventEmitter2,
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {}
  async createComment(
    userId: string,
    data: CreateCommentDto,
  ): Promise<CreateCommentResponse> {
    const session = await this.connection.startSession();
    session.startTransaction();
    let savedComment: Comment;

    try {
      const post = await this.postRepository.findById(data.postId, {
        session,
      });

      if (!post) {
        throw new BadRequestException('Post not found');
      }
      const commentData: CreateCommentData = {
        authorId: userId,
        postId: data.postId,
        content: data.content,
        parentId: data.parentId,
        mediaId: data.mediaId,
      };

      savedComment = await this.commentRepository.create(commentData, session);

      await this.postRepository.increaseCommentCount(data.postId, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException('Comment create failed: ' + error.message);
    } finally {
      session.endSession();
    }

    this.eventEmitter.emit(CommentEvents.created, savedComment);
    return savedComment as any as CreateCommentResponse;
  }
  async updateComment(
    userId: any,
    id: string,
    data: UpdateCommentDto,
  ): Promise<UpdateCommentResponse> {
    const session = await this.connection.startSession();
    session.startTransaction();
    let updatedComment: Comment | null;

    try {
      const comment = await this.commentRepository.findByIdWithMedia(
        id,
        session,
      );

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      if (comment.author.toString() !== userId) {
        throw new ForbiddenException('You are not the author of this comment');
      }

      const oldMedia = comment.mediaId;
      const oldMediaCloudId = oldMedia?.cloudinaryPublicId;
      const oldMediaType = oldMedia?.mediaType as MediaType;
      const oldMediaId = oldMedia?._id.toString();

      const updateData: UpdateCommentData = {
        content: data.content,
        mediaId: data.mediaId !== undefined ? data.mediaId : undefined,
      };

      updatedComment = await this.commentRepository.update(
        id,
        updateData,
        session,
      );

      if (
        oldMediaCloudId &&
        oldMediaId &&
        (!data.mediaId || oldMediaId !== data.mediaId)
      ) {
        await this.mediaUploadService.deleteFromDb(oldMediaId, session);
        await this.mediaUploadService.deleteFromCloud(
          oldMediaCloudId,
          oldMediaType,
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Comment update failed: ' + error.message);
    } finally {
      session.endSession();
    }
    this.eventEmitter.emit(CommentEvents.updated, updatedComment);
    return updatedComment as any as UpdateCommentResponse;
  }

  async getPostComments(
    postId: string,
    userId: string,
    limit: number = 20,
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

  async getCommentReplies(
    commentId: string,
    userId: string,
    limit: number = 20,
    cursor?: string,
  ) {
    let decodedCursorData: ReplyCursorData | undefined = undefined;
    if (cursor) {
      try {
        decodedCursorData = decodeCursor<ReplyCursorData>(cursor);
      } catch (error) {
        this.logger.warn(`Invalid reply cursor: ${cursor}`, error);
      }
    }

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
      pagination: { nextCursor, hasMore },
    };
  }
  async getTopCommentsForPosts(
    postIds: string[],
    userId: string,
  ): Promise<Map<string, Comment>> {
    if (!postIds || postIds.length === 0) {
      return new Map();
    }

    const topComments = await this.commentRepository.findTopCommentsForPosts(
      postIds.map((id) => new Types.ObjectId(id)),
      new Types.ObjectId(userId),
    );

    return new Map(
      topComments.map((comment) => [comment.post.toString(), comment]),
    );
  }
}
