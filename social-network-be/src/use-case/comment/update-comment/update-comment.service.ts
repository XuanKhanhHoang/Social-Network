import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, UpdateQuery } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { Comment } from 'src/domains/comment/interfaces/comment.type';
import { MediaBasicData } from 'src/domains/media-upload/interfaces/type';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { CommentDocument } from 'src/schemas';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { CommentEvents } from 'src/share/events';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface UpdateCommentInput {
  content?: TiptapDocument;
  mediaId?: string;
  commentId: string;
  userId: string;
}
export interface UpdateCommentOutput extends Comment {}
@Injectable()
export class UpdateCommentService extends BaseUseCaseService<
  UpdateCommentInput,
  UpdateCommentOutput
> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly commentRepository: CommentRepository,
    private readonly mediaUploadService: MediaUploadService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }
  private readonly logger = new Logger(UpdateCommentService.name);
  async execute({
    content,
    mediaId,
    commentId,
    userId,
  }: UpdateCommentInput): Promise<UpdateCommentOutput> {
    const session = await this.connection.startSession();

    try {
      const { newComment, deletedMedia } = await session.withTransaction(
        async () => {
          const comment = await this.validateOwnershipAndReturnWithMedia(
            commentId,
            userId,
            session,
          );
          const oldMedia = comment.media;
          const oldMediaId = oldMedia?.mediaId;
          const newMediaId = mediaId;

          let deletedMedia: MediaBasicData<string> | undefined = undefined;

          if (oldMedia && oldMediaId !== newMediaId) {
            deletedMedia = oldMedia;
            await this.mediaUploadService.deleteFromDb(
              oldMedia.mediaId,
              session,
            );
          }

          const updateData: UpdateQuery<CommentDocument> = {};

          if (content) {
            updateData.$set.content = content;
          }
          if (mediaId) {
            updateData.$set.mediaId = mediaId;
          }

          const updatedComment = await this.commentRepository.updateByIdAndGet(
            commentId,
            updateData,
            session,
          );

          if (!updatedComment) {
            throw new NotFoundException('Comment not found');
          }

          return {
            newComment: updatedComment.toObject() as Comment,
            deletedMedia,
          };
        },
      );
      this.eventEmitter.emit(CommentEvents.updated, newComment);
      if (deletedMedia)
        this.mediaUploadService
          .deleteFromCloudByMediaId(deletedMedia.mediaId)
          .catch((error) => {
            this.logger.error('Unexpected error in cloud cleanup', error);
          });
      return newComment;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
  private async validateOwnershipAndReturnWithMedia(
    commentId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findLeanedById<Comment>(
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
}
