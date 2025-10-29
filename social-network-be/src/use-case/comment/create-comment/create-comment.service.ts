import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment-repository.service';
import { CommentService } from 'src/domains/comment/comment.service';
import { Comment } from 'src/domains/comment/interfaces/comment.type';
import { PostRepository } from 'src/domains/post/post.repository';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
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
    private readonly commentService: CommentService,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
    private readonly logger = new Logger(CreateCommentService.name),
  ) {
    super();
  }
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
        try {
          await Promise.all([
            this.postRepository.checkIdExist(postId, {
              session,
            }),
            this.commentRepository.checkIdExist(parentId, {
              session,
            }),
          ]);
        } catch (error) {
          throw new NotFoundException('Post or comment not found');
        }
        const comment = await this.commentService.createComment(
          {
            authorId,
            content,
            mediaId,
            parentId,
            postId,
          },
          session,
        );

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
