import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import {
  PostCursorData,
  PostWithMyReaction,
  PostWithTopCommentAndUserReaction,
} from 'src/domains/post/interfaces/post.type';
import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetHomeFeedInput {
  cursor?: string;
  limit?: number;
  userId: string;
}

export interface GetHomeFeedOutput
  extends BeCursorPaginated<PostWithTopCommentAndUserReaction> {}

@Injectable()
export class GetHomeFeedService extends BaseUseCaseService<
  GetHomeFeedInput,
  GetHomeFeedOutput
> {
  private readonly logger = new Logger(GetHomeFeedService.name);
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }
  async execute(input: GetHomeFeedInput) {
    const { userId, cursor, limit = 10 } = input;
    try {
      const decodedCursor = cursor
        ? decodeCursor<PostCursorData>(cursor)
        : undefined;

      const requestingUser = await this.userRepository.findById(userId, {
        friends: 1,
      });
      if (!requestingUser) {
        throw new NotFoundException('User not found');
      }

      const authorIds = [
        userId,
        ...requestingUser.friends.map((id) => id.toString()),
      ];

      const posts = await this.postRepository.findForHomeFeed({
        limit: limit + 1,
        requestingUserId: userId,
        cursor: decodedCursor,
        authorIds: authorIds,
      });

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
        `Failed to get home feed for user ${userId}: ${error.message}`,
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
