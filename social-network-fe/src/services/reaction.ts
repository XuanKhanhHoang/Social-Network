import { ApiClient } from './api';
import { ReactionTargetType, ReactionType } from '@/lib/constants/enums';

const ENDPOINT = '/reaction';

export const reactionService = {
  reaction(
    targetId: string,
    reactionType: ReactionType,
    targetType: ReactionTargetType
  ) {
    return ApiClient.post(ENDPOINT, {
      targetId,
      targetType,
      reactionType,
    });
  },

  unReaction(targetId: string, targetType: ReactionTargetType) {
    return ApiClient.delete(
      `${ENDPOINT}/un-reaction/${targetType}/${targetId}`
    );
  },
};
