import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection, Types } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { CommentModel } from 'src/domains/comment/interfaces';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentDocument } from 'src/schemas';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

@Injectable()
export class DeleteCommentService extends BaseUseCaseService<
  { commentId: string; userId: string },
  CommentModel<Types.ObjectId, Types.ObjectId>
> {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {
    super();
  }
  private readonly logger = new Logger(DeleteCommentService.name);

  async execute({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }): Promise<CommentModel<Types.ObjectId, Types.ObjectId>> {
    const session = await this.connection.startSession();
    try {
      const result = await session.withTransaction(async () => {
        const comment = await this.validateOwnership(
          commentId,
          userId,
          session,
        );

        const deletedComment = await this.commentRepository.softDelete(
          commentId,
          session,
        );

        if (!deletedComment) {
          throw new NotFoundException('Comment not found after delete');
        }

        await this.postRepository.decreaseCommentCount(
          comment.postId.toString(),
          session,
        );

        if (comment.rootId) {
          await this.commentRepository.decreaseReplyCount(
            comment.rootId.toString(),
            session,
          );
        }

        return deletedComment.toObject();
      });

      return result as CommentModel<Types.ObjectId, Types.ObjectId>;
    } catch (error) {
      this.logger.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async validateOwnership(
    commentId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<CommentDocument> {
    const comment = await this.commentRepository.findById(commentId, session);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author._id.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    return comment;
  }
}
