import { Injectable } from '@nestjs/common';
import { ReactionService } from 'src/domains/reaction/reaction.service';
import { ReactionTargetType, ReactionType } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface ToggleReactionServiceInput {
  userId: string;
  targetId: string;
  targetType: ReactionTargetType;
  reactionType: ReactionType;
}
export interface ToggleReactionServiceOutput {
  action: string;
  reaction: any;
  delta: number;
}

@Injectable()
export class ToggleReactionService extends BaseUseCaseService<
  ToggleReactionServiceInput,
  ToggleReactionServiceOutput
> {
  constructor(private readonly reactionService: ReactionService) {
    super();
  }

  async execute(
    input: ToggleReactionServiceInput,
  ): Promise<ToggleReactionServiceOutput> {
    const { userId, targetId, targetType, reactionType } = input;
    return this.reactionService.handleReaction(
      userId,
      targetId,
      targetType,
      reactionType,
    );
  }
}
