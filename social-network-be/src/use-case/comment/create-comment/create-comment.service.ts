import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { CommentModel } from 'src/domains/comment/interfaces';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { MediaType } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CommentEvents,
  CommentReplyCreatedEventPayload,
  PostCommentedEventPayload,
  PostEvents,
} from 'src/share/events';

export interface CreateCommentInput {
  postId: string;
  content?: TiptapDocument;
  mediaId?: string;
  parentId?: string;
  authorId: string;
}
export interface CreateCommentOutput
  extends CommentModel<Types.ObjectId, Types.ObjectId> {}
@Injectable()
export class CreateCommentService extends BaseUseCaseService<
  CreateCommentInput,
  CreateCommentOutput
> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly mediaUploadService: MediaUploadService,
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }
  private readonly logger = new Logger(CreateCommentService.name);
  async execute({
    content,
    postId,
    mediaId,
    parentId,
    authorId,
  }: CreateCommentInput): Promise<CreateCommentOutput> {
    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(async () => {
        //TODO: NEED TO HANDLE Mentioned User
        const [post, author, mediaItem, parentComment] = await Promise.all([
          this.postRepository.checkIdExist(postId, {
            session,
          }),
          this.userRepository.findByIdBasic(authorId),
          mediaId
            ? this.mediaUploadService
                .findMedia([mediaId])
                .then((res) => (res?.length > 0 ? res[0] : null))
            : null,
          parentId
            ? this.commentRepository.checkIdExist(parentId, {
                session,
              })
            : null,
        ]);
        if (
          !post ||
          !author ||
          (parentId && !parentComment) ||
          (mediaId && !mediaItem)
        ) {
          throw new NotFoundException(
            'Post or Author or Parent Comment not found',
          );
        }
        if (mediaId && mediaItem.mediaType == MediaType.VIDEO)
          throw new BadRequestException('Video are not allowed to comment');

        let [res] = await Promise.all([
          this.commentRepository.create(
            {
              author: {
                _id: author._id.toString(),
                username: author.username,
                firstName: author.firstName,
                lastName: author.lastName,
                avatar: author.avatar.mediaId.toString(),
              },
              content,
              media: mediaId
                ? {
                    mediaId: mediaItem._id,
                    mediaType: mediaItem.mediaType as unknown as MediaType,
                    url: mediaItem.url,
                    width: mediaItem.width,
                    height: mediaItem.height,
                  }
                : undefined,
              parentId,
              postId,
            },
            session,
          ),
          mediaId
            ? this.mediaUploadService.confirmUploads([mediaId], authorId)
            : null,
        ]);
        const comment = res.toObject() as CommentModel<
          Types.ObjectId,
          Types.ObjectId
        >;
        if (parentId) {
          await this.commentRepository.increaseReplyCount(parentId, session);
        }
        await this.postRepository.increaseCommentCount(
          comment.postId.toString(),
          session,
        );

        return comment;
      });

      const contentSnippet = this.extractContentSnippet(content);
      if (parentId) {
        this.eventEmitter.emit(CommentEvents.replyCreated, {
          replyId: result._id.toString(),
          commentId: parentId,
          userId: authorId,
          contentSnippet,
        } as CommentReplyCreatedEventPayload);
      } else {
        this.eventEmitter.emit(PostEvents.commented, {
          commentId: result._id.toString(),
          postId,
          userId: authorId,
          contentSnippet,
        } as PostCommentedEventPayload);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private extractContentSnippet(content?: TiptapDocument): string {
    if (!content || !content.content) return '';
    try {
      const text = content.content
        .map((node) => node.content?.map((n) => n.text).join('') || '')
        .join(' ');
      return text.slice(0, 100);
    } catch (e) {
      return '';
    }
  }
}
