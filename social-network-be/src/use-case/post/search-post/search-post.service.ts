import { Injectable } from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { SearchPostCursorData } from 'src/domains/post/interfaces';
import { PostRepository } from 'src/domains/post/post.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { PostDocument } from 'src/schemas/post.schema';

@Injectable()
export class SearchPostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {}

  async execute({
    userId,
    query,
    limit,
    cursor,
  }: {
    userId: string;
    query: string;
    limit: number;
    cursor?: string;
  }): Promise<BeCursorPaginated<PostDocument>> {
    const friendIds = await this.friendshipRepository.findAllFriendIds(userId);

    let parsedCursor: SearchPostCursorData | undefined;
    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const [lastCreatedAt, lastIsFriend] = decoded.split('|');
        parsedCursor = {
          lastCreatedAt: new Date(lastCreatedAt),
          lastIsFriend: lastIsFriend === 'true',
        };
      } catch (e) {}
    }

    const posts = await this.postRepository.searchPosts({
      query,
      userId,
      friendIds,
      limit: limit + 1,
      cursor: parsedCursor,
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts[limit - 1];
      posts.pop();
      const cursorData = `${nextItem.createdAt.toISOString()}|${
        nextItem.isFriend
      }`;
      nextCursor = Buffer.from(cursorData).toString('base64');
    }

    return {
      data: posts,
      pagination: {
        nextCursor,
        hasMore: nextCursor !== null,
      },
    };
  }
}
