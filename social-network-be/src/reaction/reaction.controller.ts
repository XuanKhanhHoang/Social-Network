// reactions.controller.ts
import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReactionService } from './reaction.service';
import { ToggleReactionDto } from './dto/index.dto';
import { ReactionTargetType } from 'src/share/enums';
import { GetUserId } from 'src/share/decorators/user.decorator';

@Controller('reaction')
@UseGuards(JwtAuthGuard)
export class ReactionController {
  constructor(private reactionsService: ReactionService) {}

  @Post('')
  async toggleReaction(
    @GetUserId() userId: string,
    @Body() dto: ToggleReactionDto,
  ) {
    return this.reactionsService.toggleReaction(
      userId,
      dto.targetId,
      dto.targetType,
      dto.reactionType,
    );
  }

  @Delete('un-reaction/:type/:id')
  async removeReaction(
    @Param('type', new ParseEnumPipe(ReactionTargetType))
    targetType: ReactionTargetType,
    @Param('id') targetId: string,
    @GetUserId() userId: string,
  ) {
    return this.reactionsService.toggleReaction(userId, targetId, targetType);
  }
}
