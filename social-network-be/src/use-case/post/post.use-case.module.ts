import { Module } from '@nestjs/common';
import { GetPostFullService } from './get-post-full/get-post-full.service';
import { CreatePostService } from './create-post/create-post.service';
import { UpdatePostService } from './update-post/update-post.service';
import { ListenersService } from './listeners/listeners.service';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { MediaUploadModule } from 'src/domains/media-upload/media-upload.module';
import { UserModule } from 'src/domains/user/user.module';

@Module({
  imports: [PostModule, CommentModule, MediaUploadModule, UserModule],
  providers: [
    GetPostFullService,
    CreatePostService,
    UpdatePostService,
    ListenersService,
  ],
  exports: [GetPostFullService, CreatePostService, UpdatePostService],
})
export class PostUseCaseModule {}
