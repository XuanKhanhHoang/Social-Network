import { Module } from '@nestjs/common';
import { GetPostsFeedService } from './get-posts-feed/get-posts-feed.service';
import { GetPostFullService } from './get-post-full/get-post-full.service';
import { CreatePostService } from './create-post/create-post.service';
import { UpdatePostService } from './update-post/update-post.service';
import { ListenersService } from './listeners/listeners.service';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/comment/comment.module';
import { MediaUploadModule } from 'src/media-upload/media-upload.module';

@Module({
  imports: [PostModule, CommentModule, MediaUploadModule],
  providers: [
    GetPostsFeedService,
    GetPostFullService,
    CreatePostService,
    UpdatePostService,
    ListenersService,
  ],
  exports: [
    GetPostsFeedService,
    GetPostFullService,
    CreatePostService,
    UpdatePostService,
  ],
})
export class PostUseCaseModule {}
