import { Injectable } from '@nestjs/common';
import { CommentCursorData } from 'src/comment/comment.type';
import { CommentService } from 'src/domains/comment/comment.service';
import { CommentWithMedia } from 'src/domains/comment/interfaces/comment.type';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetPostCommentsInput = {
  postId: string;
  userId: string;
  limit?: number;
  cursor?: string;
};
export type GetPostCommentsOutput = BeCursorPaginated<CommentWithMedia>;
@Injectable()
export class GetPostCommentsService
  implements BaseUseCaseService<GetPostCommentsInput, GetPostCommentsOutput>
{
  constructor(private readonly commentService: CommentService) {}
  async execute(input: GetPostCommentsInput): Promise<GetPostCommentsOutput> {
    const limit = input.limit || 10;

    const decodedCursor = input.cursor
      ? this.commentService.decodeCursorSafely<CommentCursorData>(input.cursor)
      : undefined;
    const { comments, hasMore, nextCursor } =
      await this.commentService.getPostComments(
        input.postId,
        input.userId,
        limit,
        decodedCursor,
      );
    return {
      data: comments,
      pagination: { nextCursor, hasMore },
    };
  }
}
