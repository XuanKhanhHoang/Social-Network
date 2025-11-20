import { ClientSession, Document } from 'mongoose';
import { BaseRepository } from './base-repository.service';
import { ReactionType } from '../enums';

export abstract class ReactableRepository<
  T extends Document,
> extends BaseRepository<T> {
  async increaseReactionCount(
    id: string,
    reactionType: ReactionType,
    session?: ClientSession,
  ): Promise<T | Pick<T, keyof T> | null> {
    return this.updateByIdAndGet(
      id,
      {
        $inc: {
          reactionsCount: 1,
          [`reactionsBreakdown.${reactionType}`]: 1,
        },
      },
      session,
    );
  }
  async updateReactionCount(
    id: string,
    oldReactionType: ReactionType,
    newReactionType: ReactionType,
    session?: ClientSession,
  ): Promise<T | Pick<T, keyof T> | null> {
    const oldReactionFieldKey = `reactionsBreakdown.${oldReactionType}`;
    const oldReactionFieldRef = `$${oldReactionFieldKey}`;
    const newReactionFieldKey = `reactionsBreakdown.${newReactionType}`;
    const newReactionFieldRef = `$${newReactionFieldKey}`;
    const updatePipeline = [
      {
        $set: {
          [oldReactionFieldKey]: {
            $max: [0, { $subtract: [oldReactionFieldRef, 1] }],
          },
          [newReactionFieldKey]: {
            $add: [newReactionFieldRef, 1],
          },
        },
      },
    ];

    return this.updateByIdAndGet(id, updatePipeline, { session });
  }
  async decreaseReactionCount(
    id: string,
    reactionType: ReactionType,
    session?: ClientSession,
  ): Promise<T | Pick<T, keyof T> | null> {
    const reactionFieldKey = `reactionsBreakdown.${reactionType}`;
    const reactionFieldRef = `$${reactionFieldKey}`;
    const updatePipeline = [
      {
        $set: {
          reactionsCount: {
            $max: [0, { $subtract: ['$reactionsCount', 1] }],
          },
          [reactionFieldKey]: {
            $max: [0, { $subtract: [reactionFieldRef, 1] }],
          },
        },
      },
    ];
    return this.updateByIdAndGet(id, updatePipeline, { session });
  }
}
