import { makeEventTree } from '../utils/makeEventTree';

const Reaction = makeEventTree('reaction', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
} as const);
export const ReactionEvents = Reaction.events;
export const reactionEvent = Reaction.key;
