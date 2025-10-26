import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Model,
  PipelineStage,
  Types,
  UpdateQuery,
} from 'mongoose';
import { Comment } from 'src/schemas/comment.schema';
import { ReactionTargetType } from 'src/share/enums';
import {
  AggregatedComment,
  AggregatedReplyComment,
  CommentCursorData,
  CommentWithMedia,
  CreateCommentData,
  ReplyCursorData,
  UpdateCommentData,
} from '../comment.type';
import { BaseRepository } from 'src/share/base-class/base-repository.service';

@Injectable()
export class CommentRepository extends BaseRepository<Comment> {
  constructor(
    @InjectModel(Comment.name)
    protected readonly model: Model<Comment>,
  ) {
    super(model);
  }
  private readonly RELEVANCE_SCORE_CONFIG = {
    GRAVITY: 1.8,
    REPLY_WEIGHT: 1.5,
    MILLISECONDS_IN_HOUR: 3600000,
  };
  private getAuthorLookupStage(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
        },
      },
      { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: true } },
    ];
  }
  private getMediaLookupStage(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'mediauploads',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media',
        },
      },
      { $unwind: { path: '$media', preserveNullAndEmptyArrays: true } },
    ];
  }
  private getUserReactionLookupStage(
    userIdObj: Types.ObjectId,
  ): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'reactions',
          let: { targetCommentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetId', '$$targetCommentId'] },
                    { $eq: ['$user', userIdObj] },
                    { $eq: ['$targetType', ReactionTargetType.COMMENT] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'userReaction',
        },
      },
    ];
  }
  private getMentionUserLookupStage(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'mentionedUser',
          foreignField: '_id',
          as: 'mentionedUserInfo',
        },
      },
      {
        $unwind: {
          path: '$mentionedUserInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  async create(
    data: CreateCommentData,
    session?: ClientSession,
  ): Promise<Comment> {
    const modelData = {
      author: new Types.ObjectId(data.authorId),
      post: new Types.ObjectId(data.postId),
      content: data.content,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
      mediaId: data.mediaId ? new Types.ObjectId(data.mediaId) : undefined,
    };
    const [createdComment] = await this.model.create([modelData], { session });
    return createdComment;
  }
  async update(
    id: string,
    data: UpdateCommentData,
    session?: ClientSession,
  ): Promise<Comment | null> {
    const updateQuery: UpdateQuery<Comment> = {};
    if (data.content !== undefined) {
      updateQuery.content = data.content;
    }
    if (data.mediaId !== undefined) {
      updateQuery.mediaId = data.mediaId
        ? new Types.ObjectId(data.mediaId)
        : null;
    }
    if (Object.keys(updateQuery).length === 0) {
      return this.findById(id, session);
    }

    return this.updateByIdAndGet(id, updateQuery, session);
  }
  async findByIdWithMedia(
    id: string,
    session?: ClientSession,
  ): Promise<CommentWithMedia | null> {
    const query = this.model.findById(id).populate({
      path: 'mediaId',
      select: 'cloudinaryPublicId mediaType',
    });

    if (session) {
      query.session(session);
    }
    return query.exec() as unknown as Promise<CommentWithMedia | null>; //! NEED FIX;
  }

  async findByPostIdWithCursor(
    postId: string,
    userId: string,
    limit: number,
    cursor?: CommentCursorData,
  ): Promise<AggregatedComment[]> {
    const postIdObj = new Types.ObjectId(postId);
    const userIdObj = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        post: postIdObj,
        parentId: { $exists: false },
      },
    });
    pipeline.push({
      $addFields: {
        priority: {
          $cond: {
            if: { $eq: ['$mentionedUser', userIdObj] },
            then: 2,
            else: {
              $cond: { if: { $eq: ['$author', userIdObj] }, then: 1, else: 0 },
            },
          },
        },
      },
    });
    if (cursor) {
      const { lastPriority, lastScore, lastId } = cursor;
      pipeline.push({
        $match: {
          $or: [
            { priority: { $lt: lastPriority } },
            {
              $and: [
                { priority: { $eq: lastPriority } },
                { engagementScore: { $lt: lastScore } },
              ],
            },
            {
              $and: [
                { priority: { $eq: lastPriority } },
                { engagementScore: { $eq: lastScore } },
                { _id: { $lt: new Types.ObjectId(lastId) } },
              ],
            },
          ],
        },
      });
    }
    pipeline.push({
      $sort: {
        priority: -1,
        engagementScore: -1,
        _id: -1,
      },
    });
    pipeline.push({ $limit: limit + 1 });
    pipeline.push(...this.getAuthorLookupStage());
    pipeline.push(...this.getMediaLookupStage());
    pipeline.push(...this.getMentionUserLookupStage());
    pipeline.push(...this.getUserReactionLookupStage(userIdObj));
    pipeline.push({
      $project: {
        _id: 1,
        content: 1,
        reactionsCount: 1,
        reactionsBreakdown: 1,
        createdAt: 1,
        priority: 1,
        engagementScore: 1,
        author: {
          _id: '$authorInfo._id',
          firstName: '$authorInfo.firstName',
          lastName: '$authorInfo.lastName',
          avatar: '$authorInfo.avatar',
        },
        media: { $cond: { if: '$media', then: '$media', else: null } },
        mentionedUser: {
          $cond: {
            if: '$mentionedUserInfo',
            then: {
              _id: '$mentionedUserInfo._id',
              firstName: '$mentionedUserInfo.firstName',
              lastName: '$mentionedUserInfo.lastName',
            },
            else: null,
          },
        },
        repliesCount: 1,
        myReaction: {
          $ifNull: [{ $first: '$userReaction.reactionType' }, null],
        },
      },
    });
    return this.model.aggregate(pipeline);
  }

  async getCommentReplies(
    commentId: string,
    userId: string,
    limit: number = 20,
    cursor?: ReplyCursorData,
  ): Promise<AggregatedReplyComment[]> {
    const parentIdObj = new Types.ObjectId(commentId);
    const userIdObj = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: { parentId: parentIdObj },
    });

    pipeline.push({
      $addFields: {
        priority: {
          $cond: {
            if: { $eq: ['$mentionedUser', userIdObj] },
            then: 1,
            else: 0,
          },
        },
      },
    });

    if (cursor) {
      const { lastPriority, lastId } = cursor;
      pipeline.push({
        $match: {
          $or: [
            { priority: { $lt: lastPriority } },
            {
              $and: [
                { priority: { $eq: lastPriority } },
                { _id: { $gt: new Types.ObjectId(lastId) } },
              ],
            },
          ],
        },
      });
    }

    pipeline.push({
      $sort: {
        priority: -1,
        _id: 1,
      },
    });

    pipeline.push({ $limit: limit + 1 });

    const commonLookupStages: PipelineStage[] = [
      ...this.getAuthorLookupStage(),
      ...this.getMediaLookupStage(),
      ...this.getMentionUserLookupStage(),
      ...this.getUserReactionLookupStage(userIdObj),
      {
        $project: {
          _id: 1,
          content: 1,
          reactionsCount: 1,
          createdAt: 1,
          parentId: 1,
          priority: 1,
          author: {
            _id: '$authorInfo._id',
            firstName: '$authorInfo.firstName',
            lastName: '$authorInfo.lastName',
            avatar: '$authorInfo.avatar',
          },
          media: { $cond: { if: '$media', then: '$media', else: null } },
          mentionedUser: {
            $cond: {
              if: '$mentionedUserInfo',
              then: {
                _id: '$mentionedUserInfo._id',
                firstName: '$mentionedUserInfo.firstName',
                lastName: '$mentionedUserInfo.lastName',
              },
              else: null,
            },
          },
          myReaction: {
            $ifNull: [{ $first: '$userReaction.reactionType' }, null],
          },
        },
      },
    ];

    pipeline.push(...commonLookupStages);

    return this.model.aggregate<AggregatedReplyComment>(pipeline);
  }
  async findTopCommentsForPosts(
    postIds: Types.ObjectId[],
    userId: Types.ObjectId,
  ): Promise<any[]> {
    //  AggregatedTopComment[] //TODO NEED TO BE FIXED

    const { GRAVITY, REPLY_WEIGHT, MILLISECONDS_IN_HOUR } =
      this.RELEVANCE_SCORE_CONFIG;

    const pipeline: PipelineStage[] = [];
    pipeline.push({
      $match: {
        post: { $in: postIds },
        parentId: { $exists: false },
      },
    });

    pipeline.push(
      {
        $addFields: {
          ageInHours: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              MILLISECONDS_IN_HOUR,
            ],
          },
          engagementPoints: {
            $add: [
              '$reactionsCount',
              { $multiply: ['$repliesCount', REPLY_WEIGHT] },
            ],
          },
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $divide: [
              '$engagementPoints',
              { $pow: [{ $add: ['$ageInHours', 2] }, GRAVITY] },
            ],
          },
        },
      },
    );

    pipeline.push(
      { $sort: { post: 1, relevanceScore: -1 } },
      {
        $group: {
          _id: '$post',
          topCommentDoc: { $first: '$$ROOT' },
        },
      },
    );

    pipeline.push({
      $project: {
        _id: '$topCommentDoc._id',
        post: '$topCommentDoc.post',
        author: '$topCommentDoc.author',
        content: '$topCommentDoc.content',
        mediaId: '$topCommentDoc.mediaId',
        reactionsCount: '$topCommentDoc.reactionsCount',
        repliesCount: '$topCommentDoc.repliesCount',
        reactionsBreakdown: '$topCommentDoc.reactionsBreakdown',
        createdAt: '$topCommentDoc.createdAt',
      },
    });

    pipeline.push(
      ...this.getAuthorLookupStage(),
      ...this.getMediaLookupStage(),
      ...this.getUserReactionLookupStage(userId),
      ...this.getMentionUserLookupStage(),
    );

    pipeline.push({
      $project: {
        _id: 1,
        content: 1,
        reactionsCount: 1,
        repliesCount: 1,
        reactionsBreakdown: 1,
        createdAt: 1,
        post: 1,
        author: {
          _id: '$authorInfo._id',
          firstName: '$authorInfo.firstName',
          lastName: '$authorInfo.lastName',
          avatar: '$authorInfo.avatar',
        },
        mentionedUser: {
          $cond: {
            if: '$mentionedUserInfo',
            then: {
              _id: '$mentionedUserInfo._id',
              firstName: '$mentionedUserInfo.firstName',
              lastName: '$mentionedUserInfo.lastName',
            },
            else: null,
          },
        },
        media: { $ifNull: ['$media', null] },
        myReaction: {
          $ifNull: [{ $first: '$userReaction.reactionType' }, null],
        },
      },
    });

    return this.model.aggregate(pipeline).exec();
  }
}
