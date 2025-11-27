import { Injectable, Logger } from '@nestjs/common';
import { ReactionService } from 'src/domains/reaction/reaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReactionTargetType, ReactionType, ActionType } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { PostRepository } from 'src/domains/post/post.repository';
import { CommentRepository } from 'src/domains/comment/comment.repository';
import {
  CommentEvents,
  CommentLikedEventPayload,
  PostEvents,
  PostLikedEventPayload,
} from 'src/share/events';

export interface ToggleReactionServiceInput {
  userId: string;
  targetId: string;
  targetType: ReactionTargetType;
  reactionType: ReactionType;
}
export interface ToggleReactionServiceOutput {
  action: string;
  reaction: any;
  delta: number;
}

@Injectable()
export class ToggleReactionService extends BaseUseCaseService<
  ToggleReactionServiceInput,
  ToggleReactionServiceOutput
> {
  private readonly logger = new Logger(ToggleReactionService.name);

  constructor(
    private readonly reactionService: ReactionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {
    super();
  }

  async execute(
    input: ToggleReactionServiceInput,
  ): Promise<ToggleReactionServiceOutput> {
    const { userId, targetId, targetType, reactionType } = input;
    const result = await this.reactionService.handleReaction(
      userId,
      targetId,
      targetType,
      reactionType,
    );

    if (result.action === ActionType.CREATED) {
      if (targetType === ReactionTargetType.POST) {
        const post = await this.postRepository.findById(targetId);
        if (post) {
          if (post.author._id.toString() !== userId) {
            const payload = {
              postId: targetId,
              userId,
              ownerId: post.author._id.toString(),
              type: reactionType,
            } as PostLikedEventPayload;

            this.eventEmitter.emit(PostEvents.liked, payload);
          }
        }
      } else if (targetType === ReactionTargetType.COMMENT) {
        const comment = await this.commentRepository.findById(targetId);
        if (comment && comment.author._id.toString() !== userId) {
          this.eventEmitter.emit(CommentEvents.liked, {
            commentId: targetId,
            postId: comment.postId.toString(),
            userId,
            ownerId: comment.author._id.toString(),
          } as CommentLikedEventPayload);
        }
      }
    }

    return result;
  }
}
