import { Module } from '@nestjs/common';
import { GetHomeFeedService } from './get-home-feed/get-home-feed.service';
import { PostModule } from 'src/domains/post/post.module';
import { UserModule } from 'src/domains/user/user.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { FriendshipModule } from 'src/domains/friendship/friendship.module';

@Module({
  imports: [PostModule, UserModule, CommentModule, FriendshipModule],
  providers: [GetHomeFeedService],
  exports: [GetHomeFeedService],
})
export class FeedUseCaseModule {}
