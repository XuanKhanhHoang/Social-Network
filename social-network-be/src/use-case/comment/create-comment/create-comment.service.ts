import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { Comment } from 'src/domains/comment/interfaces/comment.type';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { MediaType } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface CreateCommentInput {
  postId: string;
  content?: TiptapDocument;
  mediaId?: string;
  parentId?: string;
  authorId: string;
}
export interface CreateCommentOutput extends Comment {}
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

        const comment = (
          await this.commentRepository.create(
            {
              author,
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
          )
        ).toObject() as Comment;
        if (parentId) {
          await this.commentRepository.increaseReplyCount(parentId, session);
        }
        await this.postRepository.increaseCommentCount(comment.postId, session);

        return comment;
      });
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
}
