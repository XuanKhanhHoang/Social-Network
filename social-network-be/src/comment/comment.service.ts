import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, PipelineStage, Types } from 'mongoose';
import { Comment, Post } from 'src/schemas';
import { CreateCommentDto, UpdateCommentDto } from './dto/req';
import { MediaUploadService } from 'src/media-upload/media-upload.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommentEvents } from 'src/share/emitter-events';
import {
  CreateCommentResponse,
  GetCommentsByPostIdResponse,
  UpdateCommentResponse,
} from './dto/res';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { CommentCursorData } from './comment.type';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectConnection() private readonly connection: Connection,
    private mediaUploadService: MediaUploadService,
    private eventEmitter: EventEmitter2,
  ) {}
  async createComment(
    userId: string,
    data: CreateCommentDto,
  ): Promise<CreateCommentResponse> {
    const { content, postId, parentId } = data;
    const mediaId = data.mediaId ? new Types.ObjectId(data.mediaId) : undefined;

    const session = await this.connection.startSession();
    session.startTransaction();
    let newComment: any;
    try {
      const post = await this.postModel.findOne(
        { _id: new Types.ObjectId(data.postId) },
        null,
        { session },
      );
      if (!post) {
        throw new BadRequestException('Post not found');
      }

      newComment = new this.commentModel({
        author: new Types.ObjectId(userId),
        post: new Types.ObjectId(postId),
        content,
        parentId,
        mediaId,
      });
      await newComment.save({ session });

      await this.postModel.updateOne(
        { _id: post._id },
        { $inc: { commentsCount: 1 } },
        { session },
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException('Comment create failed: ' + error.message);
    } finally {
      session.endSession();
    }
    this.eventEmitter.emit(CommentEvents.created, newComment);
    return newComment;
  }
  async updateComment(
    userId: any,
    id: string,
    data: UpdateCommentDto,
  ): Promise<UpdateCommentResponse> {
    const commentId = new Types.ObjectId(id);
    const newMediaId = data.mediaId ? new Types.ObjectId(data.mediaId) : null;

    const session = await this.connection.startSession();
    session.startTransaction();
    let updatedComment;
    try {
      const comment = await this.commentModel
        .findById(commentId)
        .populate({
          path: 'mediaId',
          select: 'cloudinaryPublicId mediaType',
        })
        .session(session);

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      if (comment.author.toString() !== userId) {
        throw new ForbiddenException('You are not the author of this comment');
      }
      const oldMedia = (comment as any).mediaId as any;
      const oldMediaCloudId = oldMedia?.cloudinaryPublicId;
      const oldMediaType = oldMedia?.mediaType;
      const oldMediaId = oldMedia?._id;

      const updateData: any = {};
      if (data.content !== undefined) {
        updateData.content = data.content;
      }
      if (data.mediaId !== undefined) {
        updateData.mediaId = newMediaId;
      }

      updatedComment = await this.commentModel.findByIdAndUpdate(
        commentId,
        updateData,
        {
          new: true,
          session,
          runValidators: true,
        },
      );

      if (
        oldMediaCloudId &&
        oldMediaId &&
        (!newMediaId || !oldMediaId.equals(newMediaId))
      ) {
        await this.mediaUploadService.deleteFromDb(
          oldMediaId.toString(),
          session,
        );
        await this.mediaUploadService.deleteFromCloud(
          oldMediaCloudId,
          oldMediaType,
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Comment update failed: ' + error.message);
    } finally {
      session.endSession();
    }
    this.eventEmitter.emit(CommentEvents.created, updatedComment);
    return updatedComment;
  }
  async getPostComments(
    postId: string,
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<GetCommentsByPostIdResponse> {
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
        engagementScore: { $add: ['$reactionsCount', '$repliesCount'] },
      },
    });

    if (cursor) {
      try {
        const decodedCursor = cursor.replace(/-/g, '+').replace(/_/g, '/');
        const { lastPriority, lastScore, lastId } =
          decodeCursor<CommentCursorData>(cursor);
        JSON.parse(Buffer.from(decodedCursor, 'base64').toString('ascii'));

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
      } catch (error) {
        console.error(
          'Invalid cursor format, falling back to first page:',
          error,
        );
      }
    }

    pipeline.push({
      $sort: {
        priority: -1,
        engagementScore: -1,
        _id: -1,
      },
    });

    pipeline.push({ $limit: limit + 1 });

    const commonLookupStages: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
        },
      },
      { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'mediauploads',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media',
        },
      },
      { $unwind: { path: '$media', preserveNullAndEmptyArrays: true } },
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
      {
        $lookup: {
          from: 'reactions',
          let: { commentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$commentId', '$$commentId'] },
                    { $eq: ['$userId', userIdObj] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'userReaction',
        },
      },
      {
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
          myReaction: { $ifNull: [{ $first: '$userReaction.type' }, null] },
        },
      },
    ];

    pipeline.push(...commonLookupStages);

    const comments = await this.commentModel.aggregate(pipeline);

    let nextCursor: string | null = null;
    let hasMore = false;

    if (comments.length > limit) {
      hasMore = true;
      const lastComment = comments[limit - 1];
      const cursorData: CommentCursorData = {
        lastPriority: lastComment.priority,
        lastScore: lastComment.engagementScore,
        lastId: lastComment._id.toString(),
      };
      nextCursor = encodeCursor(cursorData);
    }

    const results = comments.slice(0, limit);

    return {
      data: results,
      pagination: { nextCursor, hasMore },
    };
  }

  async getCommentReplies(
    commentId: string,
    userId: string,
    limit: number = 20,
    cursor?: string,
  ) {
    const parentIdObj = new Types.ObjectId(commentId);
    const userIdObj = new Types.ObjectId(userId);

    const commonLookupStages: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
        },
      },
      { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          content: 1,
          reactionsCount: 1,
          createdAt: 1,
          parentId: 1,
          author: {
            _id: '$authorInfo._id',
            firstName: '$authorInfo.firstName',
            lastName: '$authorInfo.lastName',
            avatar: '$authorInfo.avatar',
          },
        },
      },
    ];

    let mentionedReplies: any[] = [];
    if (!cursor) {
      mentionedReplies = await this.commentModel.aggregate([
        { $match: { parentId: parentIdObj, mentionedUser: userIdObj } },
        { $sort: { _id: 1 } },
        ...commonLookupStages,
      ]);
    }

    const otherRepliesMatch: any = {
      parentId: parentIdObj,
      mentionedUser: { $ne: userIdObj },
    };

    if (cursor) {
      otherRepliesMatch._id = { $gt: new Types.ObjectId(cursor) };
    }

    const otherReplies = await this.commentModel.aggregate([
      { $match: otherRepliesMatch },
      { $sort: { _id: 1 } },
      { $limit: limit + 1 },
      ...commonLookupStages,
    ]);

    const replies = [...mentionedReplies, ...otherReplies];

    let nextCursor: string | null = null;
    let hasMore = false;

    if (otherReplies.length > limit) {
      hasMore = true;
      nextCursor = otherReplies[limit - 1]._id.toString();
    }

    const results = replies.slice(0, limit);

    return {
      replies: results,
      pagination: { nextCursor, hasMore },
    };
  }
  async getTopCommentsForPosts(
    postIds: Types.ObjectId[],
    userId: Types.ObjectId,
  ): Promise<Map<string, Comment>> {
    const RELEVANCE_SCORE_CONFIG = {
      GRAVITY: 1.8,
      REPLY_WEIGHT: 1.5,
      MILLISECONDS_IN_HOUR: 3600000,
    };
    if (!postIds || postIds.length === 0) {
      return new Map();
    }

    const { GRAVITY, REPLY_WEIGHT, MILLISECONDS_IN_HOUR } =
      RELEVANCE_SCORE_CONFIG;
    //* FORMULA: score = (reactionsCount + (repliesCount * REPLY_WEIGHT)) / (ageInHours + 2) ^ GRAVITY
    const pipeline: PipelineStage[] = [
      {
        $match: {
          post: { $in: postIds },
          parentId: { $exists: false },
        },
      },
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
      { $sort: { post: 1, relevanceScore: -1 } },
      {
        $group: {
          _id: '$post',
          topCommentDoc: { $first: '$$ROOT' }, //* $$ROOT is a system variable that references the root document of the current stage.
        },
      },
      {
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
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorInfo',
        },
      },
      { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'mediauploads',
          localField: 'mediaId',
          foreignField: '_id',
          as: 'media',
        },
      },
      { $unwind: { path: '$media', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'reactions',
          let: { commentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$commentId', '$$commentId'] },
                    { $eq: ['$userId', userId] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'userReaction',
        },
      },
      {
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
          media: { $ifNull: ['$media', null] },
          myReaction: { $ifNull: [{ $first: '$userReaction.type' }, null] },
        },
      },
    ];

    const topComments = await this.commentModel.aggregate(pipeline);

    return new Map(
      topComments.map((comment) => [comment.post.toString(), comment]),
    );
  }
}
