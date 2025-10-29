import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CommentService } from 'src/domains/comment/comment.service';
import { Comment } from 'src/domains/comment/interfaces/comment.type';
import { Media } from 'src/media-upload/interfaces/type';
import { MediaUploadService } from 'src/media-upload/media-upload.service';
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
    private readonly commentService: CommentService,
    private readonly mediaUploadService: MediaUploadService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger = new Logger(UpdateCommentService.name),
  ) {
    super();
  }
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
          const comment =
            await this.commentService.validateOwnershipAndReturnWithMedia(
              commentId,
              userId,
              session,
            );
          const oldMedia = comment.media;
          const oldMediaId = oldMedia?._id;
          const newMediaId = mediaId;

          let deletedMedia: Media | undefined = undefined;

          if (oldMedia && oldMediaId !== newMediaId) {
            deletedMedia = oldMedia;
            await this.mediaUploadService.deleteFromDb(oldMedia._id, session);
          }

          const newComment = await this.commentService.updateComment(
            { commentId, content, mediaId },
            session,
          );
          return { newComment, deletedMedia };
        },
      );
      this.eventEmitter.emit(CommentEvents.updated, newComment);
      if (deletedMedia)
        this.mediaUploadService
          .deleteFromCloud(
            deletedMedia.cloudinaryPublicId,
            deletedMedia?.mediaType,
          )
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
}
