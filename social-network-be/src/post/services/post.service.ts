import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Types, Connection } from 'mongoose';
import { MediaUpload, Post } from 'src/schemas';
import { MediaType, UserPrivacy } from 'src/share/enums';
import { MediaUploadService } from 'src/media-upload/media-upload.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreatePostDto } from '../dto/req/create-post.dto';
import { UpdatePostDto } from '../dto/req/update-post.dto';
import { GetPostsResponse } from '../dto/res/get-posts.dto';
import { GetPostResponse } from '../dto/res/get-post.dto';
import { CreatePostResponse } from '../dto/res/create.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { CreatePostData, PaginatedPhotos, PostCursorData } from '../post.type';
import { GetPostsByCursorDto } from '../dto/req/get-posts.dto';
import { PostRepository } from './post-repository.service';
import { PostEvents, ReactionEvents } from 'src/share/events';
import { CommentService } from 'src/comment/services/comment.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private commentService: CommentService,
    private mediaUploadService: MediaUploadService,
    private eventEmitter: EventEmitter2,
    private readonly postRepository: PostRepository,
  ) {}

  @OnEvent(ReactionEvents.created)
  async handleReactionCreated(payload: any): Promise<void> {
    try {
      await this.postRepository.increaseReactionCount(payload.targetId);
    } catch (error) {
      this.logger.error(
        `Failed to increment reaction count for post ${payload.targetId}`,
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.removed)
  async handleReactionRemoved(payload: any): Promise<void> {
    try {
      await this.postRepository.decreaseReactionCount(payload.targetId);
    } catch (error) {
      this.logger.error(
        `Failed to decrement reaction count for post ${payload.targetId}`,
        error.stack,
      );
    }
  }

  //* MAIN METHODS

  async createPost(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<CreatePostResponse> {
    try {
      const media = createPostDto.media?.map((item, index) => ({
        mediaId: item.id,
        caption: item.caption || '',
        order: index,
      }));

      const postData: CreatePostData = {
        ...createPostDto,
        author: userId,
        media,
      };
      const newPost = await this.postRepository.create(postData);
      this.eventEmitter.emit(PostEvents.created, {
        targetId: newPost._id,
        authorId: userId,
      });
      return newPost as any as CreatePostResponse;
    } catch (error) {
      this.logger.error(
        `Failed to create post for user ${userId}: ${error.message}`,
        error.stack,
      );

      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid post data: ' + error.message);
      }

      throw new BadRequestException('Failed to create post');
    }
  }

  async updatePost(
    postId: string,
    userId: string,
    data: UpdatePostDto,
  ): Promise<Post> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const post = await this.postRepository.findById(postId, session);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.author.toString() !== userId) {
        throw new ForbiddenException('You are not allowed to update this post');
      }

      const mediaPost = post.media ?? [];
      const mediaInUse = data.media ?? [];
      const mediaInUseIds = new Set(mediaInUse.map((m) => m.id));

      const deletedMediaIds = mediaPost
        .filter((m) => !mediaInUseIds.has(m.mediaId.toString()))
        .map((m) => m.mediaId.toString());

      const deletedMedias: MediaUpload[] = [];
      for (const mediaId of deletedMediaIds) {
        try {
          const media = await this.mediaUploadService.deleteFromDb(
            mediaId,
            session,
          );
          if (media && !(media as any).message) {
            deletedMedias.push(media as MediaUpload);
          }
        } catch (error) {
          this.logger.warn(
            `Failed to delete media ${mediaId} from DB: ${error.message}`,
          );
        }
      }

      post.media = mediaInUse.map((item, index) => ({
        mediaId: new Types.ObjectId(item.id),
        caption: item.caption || '',
        order: index,
      }));
      post.content = data.content ?? post.content;
      post.visibility = data.visibility ?? post.visibility;
      post.backgroundValue = data.backgroundValue ?? post.backgroundValue;

      const savedPost = await this.postRepository.save(post, session);

      await session.commitTransaction();

      this.scheduleCloudCleanup(deletedMedias);
      this.eventEmitter.emit(PostEvents.created, {
        targetId: savedPost._id,
        authorId: userId,
      });
      return savedPost;
    } catch (error) {
      await session.abortTransaction();

      this.logger.error(
        `Failed to update post ${postId}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to update post');
    } finally {
      session.endSession();
    }
  }

  private scheduleCloudCleanup(deletedMedias: MediaUpload[]): void {
    if (deletedMedias.length === 0) return;

    Promise.allSettled(
      deletedMedias.map((m) =>
        this.mediaUploadService
          .deleteFromCloud(m.cloudinaryPublicId, m.mediaType as MediaType)
          .catch((error) =>
            this.logger.error(
              `Failed to delete media ${m._id} from cloud: ${error.message}`,
            ),
          ),
      ),
    ).catch((error) => {
      this.logger.error('Unexpected error in cloud cleanup', error);
    });
  }

  async getPostsByCursor(
    query: GetPostsByCursorDto,
    userId: string,
  ): Promise<GetPostsResponse> {
    try {
      const limit = query.limit || 10;
      let decodedCursor: PostCursorData | undefined = undefined;

      if (query.cursor) {
        try {
          decodedCursor = decodeCursor<PostCursorData>(query.cursor);
        } catch (error) {
          this.logger.warn(
            `Invalid cursor format: ${query.cursor}. Falling back to first page.`,
          );
        }
      }

      const posts = await this.postRepository.findByCursor(
        limit,
        userId,
        decodedCursor,
      );

      const hasMore = posts.length > limit;
      const results = posts.slice(0, limit);
      let finalResults = [];
      if (results.length > 0) {
        const postIds = results.map((p) => p._id);

        const topCommentsMap = await this.commentService.getTopCommentsForPosts(
          postIds,
          userId,
        );

        finalResults = results.map((post) => {
          const topComment = topCommentsMap.get(post._id.toString()) || null;

          return {
            ...post,
            topComment: topComment,
          };
        });
      }

      let nextCursor: string | null = null;
      if (hasMore) {
        const lastPost = posts[limit - 1];
        const cursorData: PostCursorData = {
          lastHotScore: lastPost.hotScore,
          lastId: lastPost._id.toString(),
        };
        nextCursor = encodeCursor(cursorData);
      }

      return {
        data: finalResults,
        pagination: { nextCursor, hasMore },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get posts for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve posts');
    }
  }

  async getPostById(postId: string, userId: string): Promise<GetPostResponse> {
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

  async getPhotosForUser(
    userId: string,
    visiblePrivacyLevels: UserPrivacy[],
    limit = 9,
  ): Promise<PaginatedPhotos> {
    return this.postRepository.findPhotosForUser(
      userId,
      visiblePrivacyLevels,
      limit,
    );
  }
}
