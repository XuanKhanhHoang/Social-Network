import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Model,
  PipelineStage,
  Types,
  UpdateResult,
} from 'mongoose';
import { ReactableRepository } from 'src/share/base-class/reactable-repository.service';
import {
  CreatePostData,
  PaginatedPhotos,
  PhotoPreview,
  PostCursorData,
  PostWithMyReaction,
} from './interfaces/post.type';
import { PostStatus, UserPrivacy } from 'src/share/enums';
import { PostDocument } from 'src/schemas';
@Injectable()
export class PostRepository extends ReactableRepository<PostDocument> {
  constructor(
    @InjectModel(PostDocument.name)
    protected readonly model: Model<PostDocument>,
  ) {
    super(model);
  }
  private readonly logger = new Logger(PostRepository.name);

  //* PIPELINE REUSABLE STAGES

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
            $arrayElemAt: ['$userReaction.reactionType', 0],
          },
        },
      },
      { $project: { userReaction: 0 } },
    ];
  }

  //* Handlers
  async create(
    data: CreatePostData,
    session?: ClientSession,
  ): Promise<PostDocument> {
    const media = data.media.map((item) => ({
      ...item,
      mediaId: new Types.ObjectId(item.mediaId),
    }));
    const [createdPost] = await this.model.create([{ ...data, media }], {
      session,
    });
    return createdPost;
  }
  async findForHomeFeed({
    limit,
    requestingUserId,
    cursor,
    authorIds,
  }: {
    limit: number;
    requestingUserId: string;
    cursor?: PostCursorData;
    authorIds: string[];
  }): Promise<PostWithMyReaction[]> {
    const pipeline: PipelineStage[] = [];

    const requestingUserObjId = new Types.ObjectId(requestingUserId);

    pipeline.push({ $match: { status: PostStatus.ACTIVE } });

    if (authorIds && authorIds.length > 0) {
      pipeline.push({
        $match: {
          'author._id': {
            $in: authorIds.map((id) => new Types.ObjectId(id)),
          },
        },
      });
    }

    pipeline.push({
      $match: {
        $or: [
          { 'author._id': requestingUserObjId },
          {
            'author._id': { $ne: requestingUserObjId },
            visibility: { $in: [UserPrivacy.PUBLIC, UserPrivacy.FRIENDS] },
          },
        ],
      },
    });

    if (cursor) {
      pipeline.push({
        $match: {
          $or: [
            { hotScore: { $lt: cursor.lastHotScore } },
            {
              $and: [
                { hotScore: { $eq: cursor.lastHotScore } },
                { _id: { $lt: new Types.ObjectId(cursor.lastId) } },
              ],
            },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        hotScore: -1,
        _id: -1,
      },
    });

    pipeline.push({ $limit: limit });
    pipeline.push(...this.getUserReactionStage(requestingUserId));

    return this.model.aggregate<PostWithMyReaction>(pipeline);
  }

  async findForUserProfile({
    limit,
    requestingUserId,
    cursor,
    authorId,
    visibilities,
  }: {
    limit: number;
    requestingUserId?: string;
    cursor?: PostCursorData;
    authorId: string;
    visibilities: UserPrivacy[];
  }): Promise<PostWithMyReaction[]> {
    const pipeline: PipelineStage[] = [];

    const authorObjId = new Types.ObjectId(authorId);

    pipeline.push({ $match: { status: PostStatus.ACTIVE } });
    pipeline.push({ $match: { 'author._id': authorObjId } });

    if (visibilities && visibilities.length > 0) {
      pipeline.push({
        $match: {
          visibility: { $in: visibilities },
        },
      });
    }

    if (cursor) {
      pipeline.push({
        $match: {
          $or: [
            { hotScore: { $lt: cursor.lastHotScore } },
            {
              $and: [
                { hotScore: { $eq: cursor.lastHotScore } },
                { _id: { $lt: new Types.ObjectId(cursor.lastId) } },
              ],
            },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        hotScore: -1,
        _id: -1,
      },
    });

    pipeline.push({ $limit: limit });

    if (requestingUserId) {
      pipeline.push(...this.getUserReactionStage(requestingUserId));
    }

    return this.model.aggregate<PostWithMyReaction>(pipeline);
  }
  async findFullPostById(
    postId: string,
    userId: string,
  ): Promise<PostWithMyReaction | null> {
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(postId),
          status: PostStatus.ACTIVE,
        },
      },
      ...this.getUserReactionStage(userId),
    ];

    const [post] = await this.model
      .aggregate<PostWithMyReaction>(aggregationPipeline)
      .exec();

    return post || null;
  }
  async increaseCommentCount(
    postId: string,
    session?: ClientSession,
  ): Promise<UpdateResult> {
    return this.model.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $inc: { commentsCount: 1 } },
      { session },
    );
  }
  async decreaseCommentCount(
    postId: string,
    session?: ClientSession,
  ): Promise<UpdateResult> {
    return await this.model.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $inc: { commentsCount: -1 } },
      { session },
    );
  }
  async findPhotosForUser(
    userId: string,
    privacy: UserPrivacy[],
    limit: number,
    cursor?: number,
  ): Promise<PaginatedPhotos> {
    const skipAmount = cursor || 0;

    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        'author._id': new Types.ObjectId(userId),
        status: PostStatus.ACTIVE,
        visibility: { $in: privacy },
        'media.0': { $exists: true },
      },
    });

    pipeline.push({
      $sort: { createdAt: -1 },
    });

    pipeline.push({
      $unwind: '$media',
    });

    if (skipAmount > 0) {
      pipeline.push({ $skip: skipAmount });
    }

    pipeline.push({
      $limit: limit + 1,
    });

    pipeline.push({
      $project: {
        _id: '$media.mediaId',
        postId: '$_id',
        caption: '$media.caption',
        order: '$media.order',
        url: '$media.url',
        mediaType: '$media.mediaType',
        createAt: '$createdAt',
        width: '$media.width',
        height: '$media.height',
      },
    });

    const results = await this.model.aggregate<PhotoPreview>(pipeline).exec();

    const hasMore = results.length > limit;
    const photos = results.slice(0, limit);

    const nextCursor = hasMore ? skipAmount + photos.length : null;
    return {
      photos,
      nextCursor,
    };
  }
}
