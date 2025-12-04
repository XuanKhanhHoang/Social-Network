import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types, UpdateQuery } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { CommentModel } from 'src/domains/comment/interfaces';
import { SubMediaModel } from 'src/domains/media-upload/interfaces/media';
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
export interface UpdateCommentOutput
  extends CommentModel<Types.ObjectId, Types.ObjectId> {}
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
          const [comment, newMedia] = await Promise.all([
            this.validateOwnershipAndReturnWithMedia(
              commentId,
              userId,
              session,
            ),
            mediaId
              ? this.mediaUploadService
                  .findMedia([mediaId])
                  .then((res) => (res?.length > 0 ? res[0] : null))
              : undefined,
          ]);
          const oldMedia = comment.media;

          let deletedMedia: SubMediaModel<Types.ObjectId> | undefined =
            undefined;

          if (mediaId && !newMedia)
            throw new NotFoundException('Media not found');

          if (
            oldMedia &&
            newMedia &&
            oldMedia.mediaId.toString() !== newMedia._id
          ) {
            deletedMedia = oldMedia;
            await this.mediaUploadService.deleteFromDb(
              oldMedia.mediaId.toString(),
              session,
            );
          }
          const updateData: UpdateQuery<CommentDocument> = { $set: {} };

          if (content) {
            updateData.$set.content = content;
          }
          if (newMedia) {
            updateData.$set.media = {
              mediaId: newMedia._id,
              mediaType: newMedia.mediaType,
              url: newMedia.url,
              width: newMedia.width,
              height: newMedia.height,
            };
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
            newComment: updatedComment.toObject() as CommentModel<
              Types.ObjectId,
              Types.ObjectId
            >,
            deletedMedia,
          };
        },
      );
      this.eventEmitter.emit(CommentEvents.updated, newComment);
      if (deletedMedia)
        this.mediaUploadService
          .deleteFromCloudByMediaId(deletedMedia.mediaId.toString())
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
  ): Promise<CommentModel<Types.ObjectId, Types.ObjectId>> {
    const comment = await this.commentRepository.findLeanedById<
      CommentModel<Types.ObjectId, Types.ObjectId>
    >(commentId, session);

    if (!comment) {
      throw new NotFoundException('Post not found');
    }

    if (comment.author._id.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    return comment;
  }
}
