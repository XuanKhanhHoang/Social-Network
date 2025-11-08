import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostRepository } from 'src/domains/post/post.repository';
import { ReactionCreatedEventPayload, ReactionEvents } from 'src/share/events';

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
}
