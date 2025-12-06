import { Module } from '@nestjs/common';
import { CommentModule } from 'src/domains/comment/comment.module';
import { PostModule } from 'src/domains/post/post.module';
import { RankingService } from './main-use-case/main-use-case.service';

@Module({
  imports: [CommentModule, PostModule],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingUseCaseModule {}
