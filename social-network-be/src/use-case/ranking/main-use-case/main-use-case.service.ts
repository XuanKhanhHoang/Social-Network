import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { CommentEvents, ReactionEvents } from 'src/share/events';
import { ReactionTargetType, PostStatus } from 'src/share/enums';

import {
  FilterQuery,
  ProjectionType,
  AnyBulkWriteOperation,
  Types,
} from 'mongoose';
import { PostRepository } from 'src/domains/post/post.repository';
import { PostDocument } from 'src/schemas';
import { CommentRepository } from 'src/domains/comment/comment.repository';
const POST_RANKING_CONFIG = {
  REACTION_WEIGHT: 1,
  COMMENT_WEIGHT: 3,
  SHARE_WEIGHT: 5,
  GRAVITY: 1.8,
  TIME_WINDOW_DAYS: 3,
  MILLISECONDS_IN_HOUR: 3600000,
};
interface LeanedPostForHotScore {
  _id: Types.ObjectId;
  reactionsCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  createdAt: Date;
}
@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    private postRepository: PostRepository,
    private commentRepository: CommentRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleRecalculateHotScore() {
    this.logger.log('Starting recalculation of hot scores...');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const filter: FilterQuery<PostDocument> = {
      createdAt: { $gte: threeDaysAgo },
      status: PostStatus.ACTIVE,
    };

    const projection: ProjectionType<PostDocument> = {
      reactionsCount: 1,
      commentsCount: 1,
      sharesCount: 1,
      createdAt: 1,
    };

    let postsToUpdate: LeanedPostForHotScore[];
    try {
      postsToUpdate =
        await this.postRepository.findLeaned<LeanedPostForHotScore>(filter, {
          projection,
        });
    } catch (error) {
      this.logger.error(
        'Failed to fetch posts for hot score update',
        error.stack,
      );
      return;
    }

    if (postsToUpdate.length === 0) {
      this.logger.log('No recent posts to update. Job finished.');
      return;
    }

    const bulkOps: AnyBulkWriteOperation<PostDocument>[] = postsToUpdate.map(
      (post) => {
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
      },
    );

    try {
      const result = await this.postRepository.bulkWrite(bulkOps);
      this.logger.log(
        `Successfully updated hot scores for ${result.modifiedCount} posts.`,
      );
    } catch (error) {
      this.logger.error('Failed to bulk update hot scores', error.stack);
    }
  }
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleRecalculateCommentEngagementScores() {
    this.logger.log('Starting recalculation of comment engagement scores...');
    const sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      const comments = await this.commentRepository.findLeaned<{
        reactionsCount: number;
        repliesCount: number;
        _id: string;
      }>(
        { createdAt: { $gte: sinceDate } },
        {
          projection: {
            reactionsCount: 1,
            repliesCount: 1,
            _id: 1,
          },
        },
      );

      if (comments.length === 0) {
        this.logger.log('No recent comments to update. Job finished.');
        return;
      }

      const bulkOps = comments.map((comment) => ({
        updateOne: {
          filter: { _id: comment._id },
          update: {
            $set: {
              engagementScore:
                (comment.reactionsCount || 0) + (comment.repliesCount || 0),
            },
          },
        },
      }));

      const result = await this.commentRepository.bulkWrite(bulkOps);
      this.logger.log(
        `Successfully updated engagement scores for ${result.modifiedCount} comments.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to bulk update comment engagement scores',
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.created)
  @OnEvent(ReactionEvents.removed)
  async handleReactionCountChange(payload: {
    targetId: string;
    targetType: ReactionTargetType;
  }) {
    if (payload.targetType === ReactionTargetType.POST) {
      this.logger.debug(
        `PostDocument reaction changed for: ${payload.targetId}`,
      );
      await this.recalculateSinglePostScore(payload.targetId);
    } else if (payload.targetType === ReactionTargetType.COMMENT) {
      this.logger.debug(`Comment reaction changed for: ${payload.targetId}`);
      await this.recalculateSingleCommentEngagementScore(payload.targetId);
    }
  }

  @OnEvent(CommentEvents.created)
  @OnEvent(CommentEvents.removed)
  async handleCommentChange(payload: { postId: string; parentId?: string }) {
    this.logger.debug(`Comment changed for post: ${payload.postId}`);
    await this.recalculateSinglePostScore(payload.postId);
    if (payload.parentId) {
      this.logger.debug(
        `Reply changed for parent comment: ${payload.parentId}`,
      );
      await this.recalculateSingleCommentEngagementScore(payload.parentId);
    }
  }
  async recalculateSingleCommentEngagementScore(targetId: string) {
    const comment = await this.commentRepository.findById(targetId, {
      projection: {
        reactionsCount: 1,
        repliesCount: 1,
      },
    });

    await this.commentRepository.updateById(targetId, {
      engagementScore: comment.reactionsCount + comment.repliesCount,
    });

    this.logger.log(
      `Successfully updated engagement score for comment: ${targetId}`,
    );
  }
  async recalculateSinglePostScore(targetId: string) {
    const post = await this.postRepository.findById(targetId, {
      projection: {
        reactionsCount: 1,
        commentsCount: 1,
        sharesCount: 1,
      },
    });
    const interactionScore =
      (post.reactionsCount || 0) * 1 +
      (post.commentsCount || 0) * 3 +
      (post.sharesCount || 0) * 5;

    const hoursSinceCreation =
      (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    const gravity = 1.8;

    const hotScore =
      interactionScore / Math.pow(hoursSinceCreation + 2, gravity);

    await this.postRepository.updateById(targetId, {
      hotScore: hotScore,
    });
  }
}
