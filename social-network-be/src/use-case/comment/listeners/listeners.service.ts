import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReactionTargetType } from 'src/share/enums';
import { UserEvents, UserUpdatedEventPayload } from 'src/share/events';
import {
  ReactionCreatedEventPayload,
  ReactionEvents,
  ReactionRemovedEventPayload,
  ReactionUpdatedEventPayload,
} from 'src/share/events/reaction';

@Injectable()
export class ListenersService {
  constructor(private readonly commentRepository: CommentRepository) {}
  private readonly logger = new Logger(ListenersService.name);
  @OnEvent(ReactionEvents.created)
  async handleReactionCreated(
    payload: ReactionCreatedEventPayload,
  ): Promise<void> {
    if (payload.targetType !== ReactionTargetType.COMMENT) return;
    try {
      await this.commentRepository.increaseReactionCount(
        payload.targetId,
        payload.reactionType,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increment reaction count for comment ${payload.targetId}`,
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.removed)
  async handleReactionRemoved(
    payload: ReactionRemovedEventPayload,
  ): Promise<void> {
    if (payload.targetType !== ReactionTargetType.COMMENT) return;
    try {
      await this.commentRepository.decreaseReactionCount(
        payload.targetId,
        payload.reactionType,
      );
    } catch (error) {
      this.logger.error(
        `Failed to decrement reaction count for comment ${payload.targetId}`,
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.updated)
  async handleReactionUpdated(
    payload: ReactionUpdatedEventPayload,
  ): Promise<void> {
    if (payload.targetType !== ReactionTargetType.COMMENT) return;
    try {
      await this.commentRepository.updateReactionCount(
        payload.targetId,
        payload.oldReactionType,
        payload.newReactionType,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update reaction count for comment ${payload.targetId}`,
        error.stack,
      );
    }
  }
  @OnEvent(UserEvents.updated)
  async handleUserUpdate(payload: UserUpdatedEventPayload) {
    const { newData, userId } = payload;

    const updateSet = {};

    if (newData.avatar !== undefined) {
      updateSet['author.avatar'] = newData.avatar;
    }
    if (newData.firstName !== undefined) {
      updateSet['author.firstName'] = newData.firstName;
    }
    if (newData.lastName !== undefined) {
      updateSet['author.lastName'] = newData.lastName;
    }
    if (newData.username !== undefined) {
      updateSet['author.username'] = newData.username;
    }
    if (Object.keys(updateSet).length === 0) return;

    try {
      const res = await this.commentRepository.updateMany(
        { 'author._id': new Types.ObjectId(userId) },
        { $set: updateSet },
      );
      if (res.modifiedCount == 0)
        return this.logger.warn(`Comment for user ${userId} not found`);
      this.logger.log(
        `Updated user information for ${res.modifiedCount} comments on user: ${userId}`,
      );
    } catch (error) {
      this.logger.error('Update user information error: ', error);
    }
  }
}
