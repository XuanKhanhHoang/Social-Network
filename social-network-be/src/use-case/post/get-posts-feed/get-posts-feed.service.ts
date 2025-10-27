import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CommentService } from 'src/comment/services/comment.service';
import {
  Post,
  PostWithTopComment,
} from 'src/domains/post/interfaces/post.type';
import { PostService } from 'src/domains/post/post.service';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
export interface GetPostsFeedInput {
  cursor?: string;
  limit?: number;
  userId: string;
}

export interface GetPostsFeedOutput
  extends BeCursorPaginated<PostWithTopComment> {}
@Injectable()
export class GetPostsFeedService extends BaseUseCaseService<
  GetPostsFeedInput,
  GetPostsFeedOutput
> {
  private readonly logger = new Logger(GetPostsFeedService.name);
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {
    super();
  }
  async execute(input: GetPostsFeedInput) {
    try {
      const limit = input.limit || 10;

      const decodedCursor = input.cursor
        ? this.postService.decodeCursorSafely(input.cursor)
        : undefined;

      const { posts, hasMore, nextCursor } =
        await this.postService.getPostsByCursor(
          limit,
          input.userId,
          decodedCursor,
        );

      const enrichedPosts = await this.enrichPostsWithComments(
        posts,
        input.userId,
      );

      return {
        data: enrichedPosts,
        pagination: { nextCursor, hasMore },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get posts feed for user ${input.userId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve posts');
    }
  }
  private async enrichPostsWithComments(
    posts: Post[],
    userId: string,
  ): Promise<PostWithTopComment[]> {
    if (posts.length === 0) {
      return [];
    }

    const postIds = posts.map((p) => p._id.toString());
    const topCommentsMap = await this.commentService.getTopCommentsForPosts(
      postIds,
      userId,
    );

    return posts.map((post) => ({
      ...post,
      topComment: topCommentsMap.get(post._id.toString()) || null,
    }));
  }
}
