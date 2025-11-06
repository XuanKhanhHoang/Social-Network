import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PostRepository } from 'src/domains/post/post.repository';
import { ReactionEvents } from 'src/share/events';

@Injectable()
export class ListenersService {
  constructor(private readonly postRepository: PostRepository) {}
  private readonly logger = new Logger(ListenersService.name);
  @OnEvent(ReactionEvents.created)
  async handleReactionCreated(payload: any): Promise<void> {
    try {
      await this.postRepository.increaseReactionCount(payload.targetId);
    } catch (error) {
      this.logger.error(
        `Failed to increment reaction count for post ${payload.targetId}`,
        error.stack,
      );
    }
  }

  @OnEvent(ReactionEvents.removed)
  async handleReactionRemoved(payload: any): Promise<void> {
    try {
      await this.postRepository.decreaseReactionCount(payload.targetId);
    } catch (error) {
      this.logger.error(
        `Failed to decrement reaction count for post ${payload.targetId}`,
        error.stack,
      );
    }
  }
}
