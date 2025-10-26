import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reaction } from 'src/schemas';
import { reactionEvent } from 'src/share/events';
import { ReactionTargetType, ReactionType } from 'src/share/enums';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name) private reactionModel: Model<Reaction>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Toggle reaction of a user on a target (post or comment)
   * If reactionType is not provided, it will remove the reaction
   * If reactionType is provided and the reaction already exists, it will update the reaction type
   * If reactionType is provided and the reaction does not exist, it will create a new reaction
   * @param userId The id of the user who is reacting
   * @param targetId The id of the target (post or comment) that the user is reacting on
   * @param targetType The type of the target (post or comment)
   * @param reactionType The type of the reaction (like, love, etc.)
   * @returns An object with action (created, updated, removed), reaction (the reaction document), and delta (the change in the reaction count)
   */
  async toggleReaction(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
    reactionType?: ReactionType,
  ) {
    const existingReaction = await this.reactionModel.findOne({
      user: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
    });

    let action: 'created' | 'updated' | 'removed';
    let delta = 0;

    if (!reactionType) {
      if (existingReaction) {
        await existingReaction.deleteOne();
        action = 'removed';
        delta = -1;

        this.eventEmitter.emit(reactionEvent(action), {
          targetId,
          targetType,
          userId,
          reactionType: existingReaction.reactionType,
        });

        return { action, reaction: null, delta };
      }

      return { action: 'removed', reaction: null, delta: 0 };
    }

    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        await existingReaction.deleteOne();
        action = 'removed';
        delta = -1;

        this.eventEmitter.emit(reactionEvent(action), {
          targetId,
          targetType,
          userId,
          reactionType,
        });

        return { action, reaction: null, delta };
      } else {
        const oldType = existingReaction.reactionType;
        existingReaction.reactionType = reactionType;
        await existingReaction.save();
        action = 'updated';
        delta = 0;

        this.eventEmitter.emit(reactionEvent(action), {
          targetId,
          targetType,
          userId,
          oldReactionType: oldType,
          newReactionType: reactionType,
        });

        return { action, reaction: existingReaction, delta };
      }
    } else {
      const newReaction = await this.reactionModel.create({
        user: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId),
        targetType,
        reactionType,
      });
      action = 'created';
      delta = 1;

      this.eventEmitter.emit(reactionEvent(action), {
        targetId,
        targetType,
        userId,
        reactionType,
      });

      return { action, reaction: newReaction, delta };
    }
  }
}
