import {
  RemoveReactionResponseDto,
  ToggleReactionResponseDto,
} from './reaction.dto';
import { ApiClient } from '@/services/api';
import { ReactionTargetType, ReactionType } from '@/lib/constants/enums';

const REACTION_PREFIX = '/reaction-api';

export const reactionService = {
  reaction(
    targetId: string,
    reactionType: ReactionType,
    targetType: ReactionTargetType
  ): Promise<ToggleReactionResponseDto> {
    return ApiClient.post(REACTION_PREFIX, {
      targetId,
      targetType,
      reactionType,
    });
  },

  unReaction(
    targetId: string,
    targetType: ReactionTargetType
  ): Promise<RemoveReactionResponseDto> {
    return ApiClient.delete(`${REACTION_PREFIX}/${targetType}/${targetId}`);
  },
};
