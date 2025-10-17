import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage, Connection } from 'mongoose';
import { MediaUpload, Post } from 'src/schemas';
import { MediaType, PostStatus, PostVisibility } from 'src/share/enums';
import { MediaUploadService } from 'src/media-upload/media-upload.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PostEvents, ReactionEvents } from 'src/share/emitter-events';
import { CreatePostDto } from './dto/req/create-post.dto';
import { UpdatePostDto } from './dto/req/update-post.dto';
import { GetPostsResponse } from './dto/res/get-posts.dto';
import { GetPostResponse } from './dto/res/get-post.dto';
import { CreatePostResponse } from './dto/res/create.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { PostCursorData } from './post.type';
import { GetPostsByCursorDto } from './dto/req/get-posts.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectConnection() private readonly connection: Connection,
    private commentService: CommentService,
    private mediaUploadService: MediaUploadService,
    private eventEmitter: EventEmitter2,
  ) {}

  //* PIPELINE REUSABLE STAGES
  private getAuthorLookupStage(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      { $unwind: '$author' },
    ];
  }

  private getUserReactionStage(userId: string): PipelineStage[] {
    const userObjectId = new Types.ObjectId(userId);
    return [
      {
        $lookup: {
          from: 'reactions',
          let: { targetId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetId', '$$targetId'] },
                    { $eq: ['$user', userObjectId] },
                  ],
                },
              },
            },
            { $project: { reactionType: 1 } },
          ],
          as: 'userReaction',
        },
      },
      {
        $addFields: {
          myReaction: {
            $cond: {
              if: { $gt: [{ $size: '$userReaction' }, 0] },
              then: { $arrayElemAt: ['$userReaction.reactionType', 0] },
              else: null,
            },
          },
        },
      },
      { $project: { userReaction: 0 } },
    ];
  }

  private getMediaLookupStage(): PipelineStage {
    return {
      $lookup: {
        from: 'mediauploads',
        localField: 'media.mediaId',
        foreignField: '_id',
        as: 'mediaDetails',
        pipeline: [
          { $match: { isConfirmed: true } },
          {
            $project: {
              _id: 1,
              cloudinaryUrl: 1,
              originalFilename: 1,
              mediaType: 1,
            },
          },
        ],
      },
    };
  }

  private getMediaMappingStage(): PipelineStage {
    return {
      $addFields: {
        media: {
          $map: {
            input: '$media',
            as: 'mediaItem',
            in: {
              $let: {
                vars: {
                  matchedMedia: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$mediaDetails',
                          as: 'detail',
                          cond: {
                            $eq: ['$$detail._id', '$$mediaItem.mediaId'],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  mediaId: '$$mediaItem.mediaId',
                  caption: '$$mediaItem.caption',
                  order: '$$mediaItem.order',
                  url: '$$matchedMedia.cloudinaryUrl',
                  originalFilename: '$$matchedMedia.originalFilename',
                  mediaType: '$$matchedMedia.mediaType',
                },
              },
            },
          },
        },
      },
    };
  }

  //* EVENT HANDLERS
  @OnEvent(ReactionEvents.created)
  async handleReactionCreated(payload: any): Promise<void> {
    try {
      await this.postModel.findByIdAndUpdate(payload.targetId, {
        $inc: { reactionsCount: 1 },
      });
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
      await this.postModel.findByIdAndUpdate(payload.targetId, {
        $inc: { reactionsCount: -1 },
      });
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
        mediaId: new Types.ObjectId(item.id),
        caption: item.caption || '',
        order: index,
      }));

      const postData = {
        ...createPostDto,
        author: new Types.ObjectId(userId),
        media,
      };

      const newPost = new this.postModel(postData);
      this.eventEmitter.emit(PostEvents.created, {
        targetId: newPost._id,
        authorId: userId,
      });
      return (await newPost.save()) as any as CreatePostResponse;
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
      const post = await this.postModel.findById(postId).session(session);
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

      const savedPost = await post.save({ session });

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
      const { cursor } = query;

      const pipeline: PipelineStage[] = [];

      pipeline.push({ $match: { status: PostStatus.ACTIVE } });

      if (cursor) {
        try {
          const { lastHotScore, lastId } = decodeCursor<PostCursorData>(cursor);

          pipeline.push({
            $match: {
              $or: [
                { hotScore: { $lt: lastHotScore } },
                {
                  $and: [
                    { hotScore: { $eq: lastHotScore } },
                    { _id: { $lt: new Types.ObjectId(lastId) } },
                  ],
                },
              ],
            },
          });
        } catch (error) {
          this.logger.warn(
            `Invalid cursor format: ${cursor}. Falling back to first page.`,
          );
        }
      }

      pipeline.push({
        $sort: {
          hotScore: -1,
          _id: -1,
        },
      });

      pipeline.push({ $limit: limit + 1 });

      pipeline.push(
        ...this.getAuthorLookupStage(),
        this.getMediaLookupStage(),
        this.getMediaMappingStage(),
        { $project: { mediaDetails: 0 } },
        ...this.getUserReactionStage(userId),
      );

      const posts = await this.postModel.aggregate(pipeline);
      const results = posts.slice(0, limit);
      if (results.length > 0) {
        const postIds = results.map((p) => p._id);
        const userIdObj = new Types.ObjectId(userId);

        const topCommentsMap = await this.commentService.getTopCommentsForPosts(
          postIds,
          userIdObj,
        );

        for (const post of results) {
          post.topComment = topCommentsMap.get(post._id.toString()) || null;
        }
      }
      let nextCursor: string | null = null;
      const hasMore = posts.length > limit;

      if (hasMore) {
        const lastPost = posts[limit - 1];
        const cursorData: PostCursorData = {
          lastHotScore: lastPost.hotScore,
          lastId: lastPost._id.toString(),
        };
        nextCursor = encodeCursor(cursorData);
      }

      return {
        data: results,
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
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid post ID');
    }

    try {
      const aggregationPipeline: PipelineStage[] = [
        {
          $match: {
            _id: new Types.ObjectId(postId),
            status: PostStatus.ACTIVE,
          },
        },

        ...this.getAuthorLookupStage(),

        this.getMediaLookupStage(),
        this.getMediaMappingStage(),
        { $project: { mediaDetails: 0 } },

        ...this.getUserReactionStage(userId),
      ];

      const [post] = await this.postModel.aggregate(aggregationPipeline).exec();

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.visibility === PostVisibility.PRIVATE) {
        if (post.author._id.toString() !== userId) {
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleRecalculateHotScore() {
    this.logger.log('Starting recalculation of hot scores...');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const postsToUpdate = await this.postModel
      .find(
        { createdAt: { $gte: threeDaysAgo }, status: PostStatus.ACTIVE },
        { reactionsCount: 1, commentsCount: 1, sharesCount: 1, createdAt: 1 },
      )
      .exec();

    if (postsToUpdate.length === 0) {
      this.logger.log('No recent posts to update. Job finished.');
      return;
    }

    const bulkOps = postsToUpdate.map((post: Post) => {
      const interactionScore =
        (post.reactionsCount || 0) * 1 +
        (post.commentsCount || 0) * 3 +
        (post.sharesCount || 0) * 5;

      const hoursSinceCreation =
        (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      const gravity = 1.8;

      const hotScore =
        interactionScore / Math.pow(hoursSinceCreation + 2, gravity);

      return {
        updateOne: {
          filter: { _id: post._id },
          update: { $set: { hotScore: hotScore } },
        },
      };
    });

    try {
      const result = await this.postModel.bulkWrite(bulkOps);
      this.logger.log(
        `Successfully updated hot scores for ${result.modifiedCount} posts.`,
      );
    } catch (error) {
      this.logger.error('Failed to bulk update hot scores', error.stack);
    }
  }
}
