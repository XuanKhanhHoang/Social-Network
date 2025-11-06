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
  async findByCursor(
    limit: number,
    userId: string,
    cursor?: PostCursorData,
  ): Promise<PostWithMyReaction[]> {
    const pipeline: PipelineStage[] = [];
    pipeline.push({ $match: { status: PostStatus.ACTIVE } });
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
    pipeline.push({ $limit: limit + 1 });
    pipeline.push(...this.getUserReactionStage(userId));
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
    return await this.model.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $inc: { commentCount: 1 } },
      { session },
    );
  }
  async decreaseCommentCount(
    postId: string,
    session?: ClientSession,
  ): Promise<UpdateResult> {
    return await this.model.updateOne(
      { _id: new Types.ObjectId(postId) },
      { $inc: { commentCount: -1 } },
      { session },
    );
  }
  async findPhotosForUser(
    userId: string,
    privacy: UserPrivacy[],
    limit: number,
    page = 1,
  ): Promise<PaginatedPhotos> {
    const pipeline: PipelineStage[] = [];
    const skipAmount = (page - 1) * limit;

    pipeline.push({
      $match: {
        author: new Types.ObjectId(userId),
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
        url: '$mediaDetail.url',
        mediaType: '$mediaDetail.mediaType',
      },
    });

    const results = await this.model.aggregate<PhotoPreview>(pipeline).exec();

    const hasNextPage = results.length > limit;

    const photos = results.slice(0, limit);

    return {
      photos,
      hasNextPage,
    };
  }
}
