import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  Model,
  PipelineStage,
  Types,
  UpdateQuery,
} from 'mongoose';
import { ReactionTargetType } from 'src/share/enums';
import {
  Comment,
  CommentCursorData,
  CreateCommentData,
  ReplyComment,
  ReplyCursorData,
  UpdateCommentData,
} from './interfaces/comment.type';
import { ReactableRepository } from 'src/share/base-class/reactable-repository.service';
import { CommentDocument } from 'src/schemas';

@Injectable()
export class CommentRepository extends ReactableRepository<CommentDocument> {
  constructor(
    @InjectModel(CommentDocument.name)
    protected readonly model: Model<CommentDocument>,
  ) {
    super(model);
  }
  private readonly RELEVANCE_SCORE_CONFIG = {
    GRAVITY: 1.8,
    REPLY_WEIGHT: 1.5,
    MILLISECONDS_IN_HOUR: 3600000,
  };

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

  async create(
    data: CreateCommentData,
    session?: ClientSession,
  ): Promise<CommentDocument> {
    const modelData = {
      author: data.author,
      postId: new Types.ObjectId(data.postId),
      content: data?.content,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
      media: data?.media,
    };
    const [createdComment] = await this.model.create([modelData], { session });
    return createdComment;
  }
  async update(
    id: string,
    data: UpdateCommentData,
    session?: ClientSession,
  ): Promise<CommentDocument | null> {
    const updateQuery: UpdateQuery<CommentDocument> = {};
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

  async findByPostIdWithCursor(
    postId: string,
    userId: string,
    limit: number,
    cursor?: CommentCursorData,
  ): Promise<Comment[]> {
    const postIdObj = new Types.ObjectId(postId);
    const userIdObj = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [];

    pipeline.push({
      $match: {
        postId: postIdObj,
        parentId: { $exists: false },
      },
    });
    pipeline.push({
      $addFields: {
        priority: {
          $cond: {
            if: { $eq: ['$mentionedUser._id', userIdObj] },
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
        author: 1,
        media: 1,
        postId: { $toString: '$postId' },
        mentionedUser: 1,
        repliesCount: 1,
        myReaction: {
          $ifNull: [{ $first: '$userReaction.reactionType' }, null],
        },
      },
    });
    return this.model.aggregate<Comment>(pipeline);
  }

  async getCommentReplies(
    commentId: string,
    userId: string,
    limit: number = 20,
    cursor?: ReplyCursorData,
  ): Promise<ReplyComment[]> {
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
            if: { $eq: ['$mentionedUser._id', userIdObj] },
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
      ...this.getUserReactionLookupStage(userIdObj),
      {
        $project: {
          _id: 1,
          content: 1,
          postId: { $toString: '$postId' },
          reactionsCount: 1,
          createdAt: 1,
          parentId: 1,
          priority: 1,
          author: 1,
          media: { $cond: { if: '$media', then: '$media', else: null } },
          mentionedUser: 1,
          myReaction: {
            $ifNull: [{ $first: '$userReaction.reactionType' }, null],
          },
        },
      },
    ];

    pipeline.push(...commonLookupStages);

    return this.model.aggregate<ReplyComment>(pipeline);
  }
  async findTopCommentsForPosts(
    postIdsInp: string[],
    userIdInp: string,
  ): Promise<Comment[]> {
    const postIds = postIdsInp.map((id) => new Types.ObjectId(id));
    const userId = new Types.ObjectId(userIdInp);
    const { GRAVITY, REPLY_WEIGHT, MILLISECONDS_IN_HOUR } =
      this.RELEVANCE_SCORE_CONFIG;

    const pipeline: PipelineStage[] = [];
    pipeline.push({
      $match: {
        postId: { $in: postIds },
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
      { $sort: { postId: 1, relevanceScore: -1 } },
      {
        $group: {
          _id: '$postId',
          topCommentDoc: { $first: '$$ROOT' },
        },
      },
    );

    pipeline.push({
      $project: {
        _id: '$topCommentDoc._id',
        postId: '$topCommentDoc.postId',
        author: '$topCommentDoc.author',
        content: '$topCommentDoc.content',
        mediaId: '$topCommentDoc.mediaId',
        reactionsCount: '$topCommentDoc.reactionsCount',
        repliesCount: '$topCommentDoc.repliesCount',
        reactionsBreakdown: '$topCommentDoc.reactionsBreakdown',
        createdAt: '$topCommentDoc.createdAt',
      },
    });

    pipeline.push(...this.getUserReactionLookupStage(userId));

    pipeline.push({
      $project: {
        _id: 1,
        content: 1,
        reactionsCount: 1,
        repliesCount: 1,
        reactionsBreakdown: 1,
        createdAt: 1,
        postId: { $toString: '$postId' },
        author: 1,
        mentionedUser: 1,
        media: { $ifNull: ['$media', null] },
        myReaction: {
          $ifNull: [{ $first: '$userReaction.reactionType' }, null],
        },
      },
    });

    return this.model.aggregate(pipeline).exec();
  }
  async increaseReplyCount(commentId: string, session?: ClientSession) {
    const commentIdObj = new Types.ObjectId(commentId);
    await this.model.updateOne(
      { _id: commentIdObj },
      { $inc: { repliesCount: 1 } },
      { session },
    );
  }
}
