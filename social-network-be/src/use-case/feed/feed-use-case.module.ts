import { Module } from '@nestjs/common';
import { GetHomeFeedService } from './get-home-feed/get-home-feed.service';
import { PostModule } from 'src/domains/post/post.module';
import { UserModule } from 'src/domains/user/user.module';
import { CommentModule } from 'src/domains/comment/comment.module';

@Module({
  imports: [PostModule, UserModule, CommentModule],
  providers: [GetHomeFeedService],
  exports: [GetHomeFeedService],
})
export class FeedUseCaseModule {}
