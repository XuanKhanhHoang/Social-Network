import { Injectable } from '@nestjs/common';
import { ReactionService } from 'src/domains/reaction/reaction.service';
import { ReactionTargetType } from 'src/share/enums';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface RemoveReactionServiceInput {
  userId: string;
  targetId: string;
  targetType: ReactionTargetType;
}
export interface RemoveReactionServiceOutput {
  action: string; //'removed'
  reaction: null;
  delta: number; //0
}

@Injectable()
export class RemoveReactionService extends BaseUseCaseService<
  RemoveReactionServiceInput,
  RemoveReactionServiceOutput
> {
  constructor(private readonly reactionService: ReactionService) {
    super();
  }

  async execute(
    input: RemoveReactionServiceInput,
  ): Promise<RemoveReactionServiceOutput> {
    const { userId, targetId, targetType } = input;
    return this.reactionService.removeReaction(userId, targetId, targetType);
  }
}
