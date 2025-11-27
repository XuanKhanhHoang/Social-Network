import { Module } from '@nestjs/common';
import { RemoveReactionService } from './remove-reaction/remove-reaction.service';
import { ToggleReactionService } from './toggle-reaction/toggle-reaction.service';
import { ReactionModule } from 'src/domains/reaction/reaction.module';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
@Module({
  imports: [ReactionModule, PostModule, CommentModule],
  providers: [RemoveReactionService, ToggleReactionService],
  exports: [RemoveReactionService, ToggleReactionService],
})
export class ReactionUseCaseModule {}
