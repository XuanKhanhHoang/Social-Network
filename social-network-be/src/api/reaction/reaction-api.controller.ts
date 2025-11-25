import {
  Body,
  Controller,
  Delete,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common';
import { GetUserId } from 'src/share/decorators/user.decorator';
import { ReactionTargetType } from 'src/share/enums';
import { RemoveReactionService } from 'src/use-case/reaction/remove-reaction/remove-reaction.service';
import { ToggleReactionService } from 'src/use-case/reaction/toggle-reaction/toggle-reaction.service';
import { ToggleReactionDto } from './dto/toggle-reaction.dto';

@Controller('reaction-api')
export class ReactionApiController {
  constructor(
    private readonly toggleReactionService: ToggleReactionService,
    private readonly removeReactionService: RemoveReactionService,
  ) {}

  @Post('')
  async toggleReaction(
    @GetUserId() userId: string,
    @Body() dto: ToggleReactionDto,
  ) {
    const { targetId, targetType, reactionType } = dto;
    return this.toggleReactionService.execute({
      userId,
      targetId,
      targetType,
      reactionType,
    });
  }

  @Delete(':type/:id')
  async removeReaction(
    @Param('type', new ParseEnumPipe(ReactionTargetType))
    targetType: ReactionTargetType,
    @Param('id') targetId: string,
    @GetUserId() userId: string,
  ) {
    return this.removeReactionService.execute({
      userId,
      targetId,
      targetType,
    });
  }
}
