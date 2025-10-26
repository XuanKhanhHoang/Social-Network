import { ClientSession, Document } from 'mongoose';
import { BaseRepository } from './base-repository.service';

export abstract class ReactableRepository<
  T extends Document,
> extends BaseRepository<T> {
  async increaseReactionCount(
    id: string,
    session?: ClientSession,
  ): Promise<T | null> {
    return this.updateByIdAndGet(id, { $inc: { reactionsCount: 1 } }, session);
  }

  async decreaseReactionCount(
    id: string,
    session?: ClientSession,
  ): Promise<T | null> {
    return this.updateByIdAndGet(id, { $inc: { reactionsCount: -1 } }, session);
  }
}
