import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Model,
  PipelineStage,
  Types,
  UpdateResult,
} from 'mongoose';
import { Post } from 'src/schemas';
import { ReactableRepository } from 'src/share/base-class/reactable-repository.service';
import {
  AggregatedPost,
  CreatePostData,
  PaginatedPhotos,
  PhotoPreview,
  PostCursorData,
} from '../post.type';
import { PostStatus, UserPrivacy } from 'src/share/enums';

@Injectable()
export class PostRepository extends ReactableRepository<Post> {
  private readonly logger = new Logger(PostRepository.name);

  constructor(
    @InjectModel(Post.name)
    protected readonly model: Model<Post>,
  ) {
    super(model);
  }
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
  //* Handlers
  async create(data: CreatePostData, session?: ClientSession): Promise<Post> {
    const media = data.media.map((item) => ({
      ...item,
      mediaId: new Types.ObjectId(item.mediaId),
    }));
    const [createdPost] = await this.model.create(
      [{ ...data, author: new Types.ObjectId(data.author), media }],
      { session },
    );
    return createdPost;
  }
  async findByCursor(
    limit: number,
    userId: string,
    cursor?: PostCursorData,
  ): Promise<AggregatedPost[]> {
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
    pipeline.push(
      ...this.getAuthorLookupStage(),
      this.getMediaLookupStage(),
      this.getMediaMappingStage(),
      { $project: { mediaDetails: 0 } },
      ...this.getUserReactionStage(userId),
    );
    return this.model.aggregate<AggregatedPost>(pipeline);
  }
  async findFullPostById(
    postId: string,
    userId: string,
  ): Promise<AggregatedPost | null> {
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

    const [post] = await this.model
      .aggregate<AggregatedPost>(aggregationPipeline)
      .exec();

    // 3. TRẢ VỀ KẾT QUẢ
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

    pipeline.push(this.getMediaLookupStage());

    pipeline.push({
      $addFields: {
        mediaDetail: { $arrayElemAt: ['$mediaDetails', 0] },
      },
    });

    pipeline.push({
      $project: {
        _id: '$media.mediaId',
        postId: '$_id',
        caption: '$media.caption',
        order: '$media.order',
        url: '$mediaDetail.cloudinaryUrl',
        originalFilename: '$mediaDetail.originalFilename',
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
