import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { reactionEvent } from 'src/share/events';
import { ReactionTargetType, ReactionType } from 'src/share/enums';
import { ReactionDocument } from 'src/schemas/reaction.schema';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(ReactionDocument.name)
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
      const action = 'updated';
      const delta = 0;

      this.eventEmitter.emit(reactionEvent(action), {
        targetId,
        targetType,
        userId,
        oldReactionType: oldType,
        newReactionType: reactionType,
      });

      return { action, reaction: existingReaction, delta };
    } else {
      const newReaction = await this.reactionModel.create({
        user: new Types.ObjectId(userId),
        targetId: new Types.ObjectId(targetId),
        targetType,
        reactionType,
      });
      const action = 'created';
      const delta = 1;

      this.eventEmitter.emit(reactionEvent(action), {
        targetId,
        targetType,
        userId,
        reactionType,
      });

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
      return { action: 'removed', reaction: null, delta: 0 };
    }

    await existingReaction.deleteOne();
    const action = 'removed';
    const delta = -1;

    this.eventEmitter.emit(reactionEvent(action), {
      targetId,
      userId,
      targetType,
      reactionType: existingReaction.reactionType,
    });

    return { action, reaction: null, delta };
  }
}
