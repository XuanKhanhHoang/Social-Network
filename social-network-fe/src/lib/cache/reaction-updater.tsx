import { ReactionType } from '@/lib/constants/enums';
import { ReactionsBreakdownDto } from '../dtos';

export interface Reactable {
  myReaction: ReactionType | keyof ReactionsBreakdownDto | null;
  reactionsCount: number;
  reactionsBreakdown: ReactionsBreakdownDto;
}
export function getUpdatedReactionState<T extends Reactable>(
  entity: T,
  newReaction: ReactionType | null,
  previousReaction?: ReactionType | null
): T {
  const newBreakdown = { ...entity.reactionsBreakdown };
  let newReactionsCount = entity.reactionsCount;

  if (previousReaction) {
    newBreakdown[previousReaction] = Math.max(
      0,
      (newBreakdown[previousReaction] || 0) - 1
    );
    newReactionsCount--;
  }

  if (newReaction) {
    newBreakdown[newReaction] = (newBreakdown[newReaction] || 0) + 1;
    newReactionsCount++;
  }

  return {
    ...entity,
    myReaction: newReaction,
    reactionsCount: Math.max(0, newReactionsCount),
    reactionsBreakdown: newBreakdown,
  };
}
