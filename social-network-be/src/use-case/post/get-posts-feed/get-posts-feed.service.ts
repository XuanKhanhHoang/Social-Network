import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import {
  PostCursorData,
  PostWithMyReaction,
  PostWithTopCommentAndUserReaction,
} from 'src/domains/post/interfaces/post.type';
import { PostRepository } from 'src/domains/post/post.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
export interface GetPostsFeedInput {
  cursor?: string;
  limit?: number;
  userId: string;
}

export interface GetPostsFeedOutput
  extends BeCursorPaginated<PostWithTopCommentAndUserReaction> {}
@Injectable()
export class GetPostsFeedService extends BaseUseCaseService<
  GetPostsFeedInput,
  GetPostsFeedOutput
> {
  private readonly logger = new Logger(GetPostsFeedService.name);
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {
    super();
  }
  async execute(input: GetPostsFeedInput) {
    const { userId, cursor, limit = 10 } = input;
    try {
      const decodedCursor = cursor
        ? decodeCursor<PostCursorData>(cursor)
        : undefined;

      const posts = await this.postRepository.findByCursor(
        limit + 1,
        userId,
        decodedCursor,
      );

      const hasMore = posts.length > limit;

      let nextCursor: string | null = null;
      if (hasMore) {
        const lastPost = posts[limit - 1];
        nextCursor = encodeCursor({
          lastHotScore: lastPost.hotScore,
          lastId: lastPost._id.toString(),
        });
      }
      const enrichedPosts = await this.enrichPostsWithComments(
        posts.slice(0, limit),
        userId,
      );
      return {
        data: enrichedPosts,
        pagination: { nextCursor, hasMore },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get posts feed for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve posts');
    }
  }
  private async enrichPostsWithComments(
    posts: PostWithMyReaction[],
    userId: string,
  ): Promise<PostWithTopCommentAndUserReaction[]> {
    if (posts.length === 0) {
      return [];
    }

    const postIds = posts.map((p) => p._id.toString());
    const comments = await this.commentRepository.findTopCommentsForPosts(
      postIds,
      userId,
    );
    const topCommentsMap = new Map(
      comments.map((comment) => [comment.postId, comment]),
    );
    return posts.map((post) => ({
      ...post,
      topComment: topCommentsMap.get(post._id.toString()) || null,
    }));
  }
}
