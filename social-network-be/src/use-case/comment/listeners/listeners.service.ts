import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import { ReactionTargetType } from 'src/share/enums';
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
}
