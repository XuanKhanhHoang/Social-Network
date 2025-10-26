import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { PostModule } from 'src/post/post.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [PostModule, CommentModule],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
