import { makeEventTree } from './makeTree';

const Reaction = makeEventTree('reaction', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
} as const);
export const ReactionEvents = Reaction.events;
export const reactionEvent = Reaction.key;
