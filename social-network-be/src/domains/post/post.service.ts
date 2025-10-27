import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostCursorData } from 'src/post/post.type';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import {
  CreatePostData,
  PaginatedPhotos,
  Post,
  UpdatePostData,
} from './interfaces/post.type';
import { UserPrivacy } from 'src/share/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostEvents } from 'src/share/events';
import { PostDocument } from 'src/schemas';
import { ClientSession, Types, UpdateQuery } from 'mongoose';

@Injectable()
export class PostService {
  constructor(
    private postRepository: PostRepository,
    private emitter: EventEmitter2,
    private logger = new Logger(PostService.name),
  ) {}

  async getPostsByCursor(
    limit: number,
    userId: string,
    decodedCursor?: PostCursorData,
  ): Promise<{ posts: Post[]; hasMore: boolean; nextCursor: string | null }> {
    const posts = await this.postRepository.findByCursor(
      limit + 1,
      userId,
      decodedCursor,
    );

    const hasMore = posts.length > limit;
    const results = posts.slice(0, limit);

    let nextCursor: string | null = null;
    if (hasMore) {
      const lastPost = posts[limit - 1];
      nextCursor = encodeCursor({
        lastHotScore: lastPost.hotScore,
        lastId: lastPost._id.toString(),
      });
    }

    return { posts: results, hasMore, nextCursor };
  }
  async getPostById(postId: string, userId: string): Promise<Post> {
    try {
      const post = await this.postRepository.findFullPostById(postId, userId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.visibility === UserPrivacy.PRIVATE) {
        if (post.author.toString() !== userId) {
          throw new ForbiddenException('You are not allowed to view this post');
        }
      }

      return post;
    } catch (error) {
      this.logger.error(
        `Failed to get post ${postId}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve post');
    }
  }

  async getUserPhotos(
    userId: string,
    visiblePrivacyLevels: UserPrivacy[],
    limit: number,
    page: number,
  ): Promise<PaginatedPhotos> {
    return this.postRepository.findPhotosForUser(
      userId,
      visiblePrivacyLevels,
      limit,
      page,
    );
  }

  async createPost(data: CreatePostData): Promise<PostDocument> {
    try {
      const newPost = await this.postRepository.create(data);
      this.emitter.emit(PostEvents.created, {
        targetId: newPost._id,
        authorId: data.author,
      });
      return newPost;
    } catch (error) {
      this.logger.error(
        `Failed to create post for user ${data.author}: ${error.message}`,
        error.stack,
      );

      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid post data: ' + error.message);
      }

      throw new BadRequestException('Failed to create post');
    }
  }

  async validateOwnership(
    postId: string,
    userId: string,
    session?: ClientSession,
  ): Promise<PostDocument> {
    const post = await this.postRepository.findById(postId, session);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    return post;
  }

  async updatePostData(
    data: UpdatePostData,
    session?: ClientSession,
  ): Promise<PostDocument> {
    const updateData: UpdateQuery<Post> = {
      $set: {
        media: data.media.map((item, index) => ({
          mediaId: new Types.ObjectId(item.mediaId),
          caption: item.caption || '',
          order: index,
        })),
        updatedAt: new Date(),
      },
    };

    if (data.content !== undefined) {
      updateData.$set.content = data.content;
    }
    if (data.visibility !== undefined) {
      updateData.$set.visibility = data.visibility;
    }
    if (data.backgroundValue !== undefined) {
      updateData.$set.backgroundValue = data.backgroundValue;
    }

    const updatedPost = await this.postRepository.updateByIdAndGet(
      data.postId,
      updateData,
      session,
    );

    if (!updatedPost) {
      throw new NotFoundException('Post not found');
    }

    return updatedPost;
  }
  decodeCursorSafely(cursor: string): PostCursorData | undefined {
    try {
      return decodeCursor<PostCursorData>(cursor);
    } catch (error) {
      this.logger.warn(`Invalid cursor format: ${cursor}`);
      return undefined;
    }
  }
  getMediaIds(post: Post | PostDocument): string[] {
    return post.media?.map((m) => m.mediaId.toString()) || [];
  }
}
