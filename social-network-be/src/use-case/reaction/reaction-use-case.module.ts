import { Module } from '@nestjs/common';
import { RemoveReactionService } from './remove-reaction/remove-reaction.service';
import { ToggleReactionService } from './toggle-reaction/toggle-reaction.service';
import { ReactionModule } from 'src/domains/reaction/reaction.module';
@Module({
  imports: [ReactionModule],
  providers: [RemoveReactionService, ToggleReactionService],
  exports: [RemoveReactionService, ToggleReactionService],
})
export class ReactionUseCaseModule {}
