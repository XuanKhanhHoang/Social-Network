import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { PostRepository } from 'src/domains/post/post.repository';
import {
  ReactionCreatedEventPayload,
  ReactionEvents,
  UserEvents,
  UserUpdatedEventPayload,
} from 'src/share/events';

@Injectable()
export class ListenersService {
  constructor(private readonly postRepository: PostRepository) {}
  private readonly logger = new Logger(ListenersService.name);
  @OnEvent(ReactionEvents.created)
  async handleReactionCreated(
    payload: ReactionCreatedEventPayload,
  ): Promise<void> {
    try {
      await this.postRepository.increaseReactionCount(
        payload.targetId,
        payload.reactionType,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increment reaction count for post ${payload.targetId}`,
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.updated)
  async handleReactionUpdated(payload: any): Promise<void> {
    try {
      await this.postRepository.updateReactionCount(
        payload.targetId,
        payload.oldReactionType,
        payload.newReactionType,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update reaction count for post ${payload.targetId}`,
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.removed)
  async handleReactionRemoved(payload: any): Promise<void> {
    try {
      await this.postRepository.decreaseReactionCount(
        payload.targetId,
        payload.reactionType,
      );
    } catch (error) {
      this.logger.error(
        `Failed to decrement reaction count for post ${payload.targetId}`,
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
      const res = await this.postRepository.updateMany(
        { 'author._id': new Types.ObjectId(userId) },
        { $set: updateSet },
      );
      if (res.modifiedCount == 0)
        return this.logger.warn(`Post for user ${userId} not found`);
      this.logger.log(
        `Updated user information for ${res.modifiedCount} posts on user: ${userId}`,
      );
    } catch (error) {
      this.logger.error('Handle Update User Info Error: ', error);
    }
  }
}
