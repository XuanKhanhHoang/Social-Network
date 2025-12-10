import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import {
  UserProfilePostCursorData,
  PostWithMyReactionModel,
  PostWithTopCommentAndUserReactionModel,
} from 'src/domains/post/interfaces';

import { PostRepository } from 'src/domains/post/post.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { UserPrivacy } from 'src/share/enums';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserPostsInput {
  cursor?: string;
  limit?: number;
  username: string;
  userId?: string;
}

export interface GetUserPostsOutput
  extends BeCursorPaginated<
    PostWithTopCommentAndUserReactionModel<Types.ObjectId>
  > {}

@Injectable()
export class GetUserPostsService extends BaseUseCaseService<
  GetUserPostsInput,
  GetUserPostsOutput
> {
  private readonly logger = new Logger(GetUserPostsService.name);
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    private readonly friendshipService: FriendshipRepository,
  ) {
    super();
  }
  async execute(input: GetUserPostsInput): Promise<GetUserPostsOutput> {
    const { userId, cursor, limit = 10, username } = input;
    try {
      const decodedCursor = cursor
        ? decodeCursor<UserProfilePostCursorData>(cursor)
        : undefined;

      const visibilities: UserPrivacy[] = [UserPrivacy.PUBLIC];

      const targetUser = await this.userRepository.findByUsername(username);
      if (!targetUser || targetUser.deletedAt) {
        throw new NotFoundException('User not found');
      }

      const targetUserId = targetUser._id.toString();

      if (userId) {
        if (targetUserId === userId) {
          visibilities.push(UserPrivacy.PRIVATE, UserPrivacy.FRIENDS);
        } else if (
          await this.friendshipService.areFriends(targetUserId, userId)
        ) {
          visibilities.push(UserPrivacy.FRIENDS);
        }
      }

      const posts = await this.postRepository.findForUserProfile({
        limit: limit + 1,
        requestingUserId: userId,
        cursor: decodedCursor,
        authorId: targetUserId,
        visibilities: visibilities,
      });

      const hasMore = posts.length > limit;

      let nextCursor: string | null = null;
      if (hasMore) {
        const lastPost = posts[limit - 1];
        nextCursor = encodeCursor({
          lastCreatedAt: lastPost.createdAt.toISOString(),
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
        `Failed to get user posts for ${username}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve posts');
    }
  }

  private async enrichPostsWithComments(
    posts: PostWithMyReactionModel<Types.ObjectId>[],
    userId?: string,
  ): Promise<PostWithTopCommentAndUserReactionModel<Types.ObjectId>[]> {
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
