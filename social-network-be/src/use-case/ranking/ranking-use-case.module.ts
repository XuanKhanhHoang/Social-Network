import { Module } from '@nestjs/common';
import { CommentModule } from 'src/domains/comment/comment.module';
import { PostModule } from 'src/domains/post/post.module';

@Module({
  imports: [CommentModule, PostModule],
  providers: [RankingUseCaseModule],
  exports: [RankingUseCaseModule],
})
export class RankingUseCaseModule {}
