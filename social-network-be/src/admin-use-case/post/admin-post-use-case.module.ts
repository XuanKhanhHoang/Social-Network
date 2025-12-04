import { Module } from '@nestjs/common';
import { PostModule } from 'src/domains/post/post.module';
import { GetPostsService } from './get-posts/get-posts.service';

@Module({
  imports: [PostModule],
  providers: [GetPostsService],
  exports: [GetPostsService],
})
export class AdminPostUseCaseModule {}
