import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ReactionCreatedEventPayload,
  reactionEvent,
  ReactionRemovedEventPayload,
  ReactionUpdatedEventPayload,
} from 'src/share/events';
import { ReactionTargetType, ReactionType, ActionType } from 'src/share/enums';
import { ReactionDocument } from 'src/schemas/reaction.schema';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel('Reaction')
    private reactionModel: Model<ReactionDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async handleReaction(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
    reactionType: ReactionType,
  ) {
    const existingReaction = await this.reactionModel.findOne({
      user: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
    });
    if (existingReaction) {
      const oldType = existingReaction.reactionType;
      existingReaction.reactionType = reactionType;
      await existingReaction.save();
      const action = ActionType.UPDATED;
      const delta = 0;

      const payload: ReactionUpdatedEventPayload = {
        targetId,
        targetType,
        userId,
        oldReactionType: oldType,
        newReactionType: reactionType,
      };
      this.eventEmitter.emit(reactionEvent(action), payload);

      return { action, reaction: existingReaction, delta };
    } else {
      const newReaction = await this.reactionModel.create({
        user: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId),
        targetType,
        reactionType,
      });
      const action = ActionType.CREATED;
      const delta = 1;
      const payload: ReactionCreatedEventPayload = {
        targetId,
        targetType,
        userId,
        reactionType,
      };
      this.eventEmitter.emit(reactionEvent(action), payload);

      return { action, reaction: newReaction, delta };
    }
  }

  async removeReaction(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
  ) {
    const existingReaction = await this.reactionModel.findOne({
      user: new Types.ObjectId(userId),
      targetId: new Types.ObjectId(targetId),
      targetType,
    });

    if (!existingReaction) {
      return { action: ActionType.REMOVED, reaction: null, delta: 0 };
    }

    await existingReaction.deleteOne();
    const action = ActionType.REMOVED;
    const delta = -1;

    const payload: ReactionRemovedEventPayload = {
      targetId,
      userId,
      targetType,
      reactionType: existingReaction.reactionType,
    };
    this.eventEmitter.emit(reactionEvent(action), payload);

    return { action, reaction: null, delta };
  }
}
