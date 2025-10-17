import { ReactionType } from '@/lib/constants/enums';

export interface Reactable {
  userReaction?: ReactionType;
  myReaction?: ReactionType; // Giữ lại cả 2 cho nhất quán
  reactionsCount: number;
  reactionsBreakdown: { [key in ReactionType]?: number };
}
/**
 * Updates the reaction state of a given entity based on the new reaction type
 * and the previous reaction type (if any). It returns a new object with the
 * updated reaction state.
 *
 * @param entity The entity to be updated.
 * @param newReaction The new reaction type. If null, it means the user is
 * removing their reaction.
 * @param previousReaction The previous reaction type of the user. If null, it
 * means the user has not reacted before.
 * @returns The updated entity with the new reaction state.
 */
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
    userReaction: newReaction ?? undefined,
    myReaction: newReaction ?? undefined,
    reactionsCount: Math.max(0, newReactionsCount),
    reactionsBreakdown: newBreakdown,
  };
}
