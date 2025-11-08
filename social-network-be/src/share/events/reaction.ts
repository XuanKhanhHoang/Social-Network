import { ReactionTargetType, ReactionType } from '../enums';
import { makeEventTree } from '../utils/makeEventTree';

const Reaction = makeEventTree('reaction', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
} as const);
export const ReactionEvents = Reaction.events;
export const reactionEvent = Reaction.key;

export type ReactionCreatedEventPayload = {
  targetId: string;
  targetType: ReactionTargetType;
  userId: string;
  reactionType: ReactionType;
};

export type ReactionRemovedEventPayload = {
  targetId: string;
  targetType: ReactionTargetType;
  userId: string;
  reactionType: ReactionType;
};

export type ReactionUpdatedEventPayload = {
  targetId: string;
  targetType: ReactionTargetType;
  userId: string;
  oldReactionType: ReactionType;
  newReactionType: ReactionType;
};
