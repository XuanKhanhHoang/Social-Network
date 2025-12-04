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
import { PostStatus, UserPrivacy } from 'src/share/enums';
import { PostDocument } from 'src/schemas';
import {
  CreatePostData,
  FindPhotosForUserResults,
  FindPostForHomeFeedData,
  PostCursorData,
  PostPhotoModel,
  PostWithMyReactionModel,
  PostWithRankingScore,
  SearchPostCursorData,
} from './interfaces';

@Injectable()
export class PostRepository extends ReactableRepository<PostDocument> {
  constructor(
    @InjectModel('Post')
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

  private getParentPostStage(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'posts',
          localField: 'parentPost',
          foreignField: '_id',
          as: 'parentPost',
        },
      },
      {
        $unwind: {
          path: '$parentPost',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'parentPost.author._id',
          foreignField: '_id',
          as: 'parentPostAuthor',
        },
      },
      {
        $unwind: {
          path: '$parentPostAuthor',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          parentPost: {
            $cond: {
              if: { $not: ['$parentPost._id'] },
              then: '$$REMOVE',
              else: {
                $cond: {
                  if: { $ne: ['$parentPost.status', PostStatus.ACTIVE] },
                  then: {
                    _id: '$parentPost._id',
                    isDeleted: true,
                  },
                  else: {
                    $mergeObjects: [
                      '$parentPost',
                      {
                        author: {
                          $cond: {
                            if: { $ifNull: ['$parentPostAuthor', false] },
                            then: {
                              _id: '$parentPostAuthor._id',
                              username: '$parentPostAuthor.username',
                              firstName: '$parentPostAuthor.firstName',
                              lastName: '$parentPostAuthor.lastName',
                              avatar: '$parentPostAuthor.avatar.url',
                            },
                            else: '$parentPost.author',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          parentPostAuthor: 0,
        },
      },
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
    const [createdPost] = await this.model.create(
      [
        {
          ...data,
          media,
          author: {
            ...data.author,
            _id: new Types.ObjectId(data.author._id),
          },
        },
      ],
      {
        session,
      },
    );
    return createdPost;
  }

  async findForHomeFeed({
    limit,
    requestingUserId,
    cursor,
    friendIds,
  }: Omit<FindPostForHomeFeedData, 'authorIds'> & {
    friendIds: string[];
  }): Promise<PostWithRankingScore[]> {
    const pipeline: PipelineStage[] = [];

    const requestingUserObjId = new Types.ObjectId(requestingUserId);
    const friendObjIds = friendIds.map((id) => new Types.ObjectId(id));

    pipeline.push({ $match: { status: PostStatus.ACTIVE } });

    pipeline.push({
      $match: {
        $or: [
          { 'author._id': requestingUserObjId },
          {
            'author._id': { $in: friendObjIds },
            visibility: { $in: [UserPrivacy.FRIENDS, UserPrivacy.PUBLIC] },
          },
          {
            'author._id': { $nin: [...friendObjIds, requestingUserObjId] },
            visibility: UserPrivacy.PUBLIC,
          },
        ],
      },
    });

    pipeline.push({
      $addFields: {
        isFriend: { $in: ['$author._id', friendObjIds] },
      },
    });

    pipeline.push({
      $addFields: {
        rankingScore: {
          $add: [{ $ifNull: ['$hotScore', 0] }, { $cond: ['$isFriend', 2, 0] }],
        },
      },
    });

    if (cursor) {
      pipeline.push({
        $match: {
          $or: [
            { rankingScore: { $lt: cursor.lastHotScore } },
            {
              $and: [
                { rankingScore: { $eq: cursor.lastHotScore } },
                { _id: { $lt: new Types.ObjectId(cursor.lastId) } },
              ],
            },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        rankingScore: -1,
        _id: -1,
      },
    });

    pipeline.push({ $limit: limit });
    pipeline.push(...this.getUserReactionStage(requestingUserId));
    pipeline.push(...this.getParentPostStage());

    pipeline.push({
      $project: {
        isFriend: 0,
      },
    });

    return this.model.aggregate<PostWithRankingScore>(pipeline);
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
  }): Promise<PostWithMyReactionModel<Types.ObjectId>[]> {
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
    pipeline.push(...this.getParentPostStage());

    return this.model.aggregate<PostWithMyReactionModel<Types.ObjectId>>(
      pipeline,
    );
  }
  async findFullPostById(
    postId: string,
    userId: string,
  ): Promise<PostWithMyReactionModel<Types.ObjectId> | null> {
    const aggregationPipeline: PipelineStage[] = [
      {
        $match: {
          _id: new Types.ObjectId(postId),
          status: PostStatus.ACTIVE,
        },
      },
      ...this.getUserReactionStage(userId),
      ...this.getParentPostStage(),
    ];

    const [post] = await this.model
      .aggregate<PostWithMyReactionModel<Types.ObjectId>>(aggregationPipeline)
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
  ): Promise<FindPhotosForUserResults> {
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

    const results = await this.model
      .aggregate<PostPhotoModel<Types.ObjectId, Types.ObjectId>>(pipeline)
      .exec();

    const hasMore = results.length > limit;
    const photos = results.slice(0, limit);

    const nextCursor = hasMore ? skipAmount + photos.length : null;
    return {
      photos,
      nextCursor,
    };
  }
  async searchPosts({
    query,
    userId,
    friendIds,
    limit,
    cursor,
  }: {
    query: string;
    userId: string;
    friendIds: string[];
    limit: number;
    cursor?: SearchPostCursorData;
  }): Promise<PostWithRankingScore[]> {
    const pipeline: PipelineStage[] = [];
    const userObjId = new Types.ObjectId(userId);
    const friendObjIds = friendIds.map((id) => new Types.ObjectId(id));
    pipeline.push({
      $match: {
        status: PostStatus.ACTIVE,
        plain_text: { $regex: query, $options: 'i' },
      },
    });
    pipeline.push({
      $match: {
        $or: [
          { 'author._id': userObjId },
          {
            'author._id': { $in: friendObjIds },
            visibility: { $in: [UserPrivacy.FRIENDS, UserPrivacy.PUBLIC] },
          },
          {
            'author._id': { $nin: [...friendObjIds, userObjId] },
            visibility: UserPrivacy.PUBLIC,
          },
        ],
      },
    });
    pipeline.push({
      $addFields: {
        isFriend: { $in: ['$author._id', friendObjIds] },
      },
    });
    if (cursor) {
      pipeline.push({
        $match: {
          $or: [
            {
              isFriend: cursor.lastIsFriend,
              createdAt: { $lt: cursor.lastCreatedAt },
            },
            {
              isFriend: { $lt: cursor.lastIsFriend },
            },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        isFriend: -1,
        createdAt: -1,
      },
    });
    pipeline.push({ $limit: limit });
    pipeline.push(...this.getUserReactionStage(userId));
    pipeline.push(...this.getParentPostStage());

    return this.model.aggregate<PostWithRankingScore>(pipeline);
  }

  async updateShareCount(postId: string, delta: number) {
    return this.model.updateOne(
      { _id: postId },
      { $inc: { sharesCount: delta } },
    );
  }

  async softDelete(postId: string): Promise<void> {
    await this.model.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $set: {
          status: PostStatus.DELETED,
          deletedAt: new Date(),
        },
      },
    );
  }

  async findExpiredDeletedPosts(thresholdDate: Date): Promise<PostDocument[]> {
    return this.model.find({
      status: PostStatus.DELETED,
      deletedAt: { $lt: thresholdDate },
    });
  }

  async hardDeletePosts(postIds: string[]): Promise<void> {
    await this.model.deleteMany({
      _id: { $in: postIds.map((id) => new Types.ObjectId(id)) },
    });
  }

  async findForAdmin({
    page,
    limit,
    searchId,
    includeDeleted,
  }: {
    page: number;
    limit: number;
    searchId?: string;
    includeDeleted?: boolean;
  }): Promise<{ data: PostDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    if (searchId) {
      filter._id = new Types.ObjectId(searchId);
    }

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .select(
          '_id author content plain_text visibility status reactionsCount commentsCount sharesCount createdAt deletedAt',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return { data, total };
  }
}
