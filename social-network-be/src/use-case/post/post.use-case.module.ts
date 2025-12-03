import { Module } from '@nestjs/common';
import { GetPostFullService } from './get-post-full/get-post-full.service';
import { CreatePostService } from './create-post/create-post.service';
import { UpdatePostService } from './update-post/update-post.service';
import { ListenersService } from './listeners/listeners.service';
import { PostModule } from 'src/domains/post/post.module';
import { CommentModule } from 'src/domains/comment/comment.module';
import { MediaUploadModule } from 'src/domains/media-upload/media-upload.module';
import { UserModule } from 'src/domains/user/user.module';

import { SearchPostService } from './search-post/search-post.service';
import { FriendshipModule } from 'src/domains/friendship/friendship.module';

@Module({
  imports: [
    PostModule,
    CommentModule,
    MediaUploadModule,
    UserModule,
    FriendshipModule,
  ],
  providers: [
    GetPostFullService,
    CreatePostService,
    UpdatePostService,
    ListenersService,
    SearchPostService,
  ],
  exports: [
    GetPostFullService,
    CreatePostService,
    UpdatePostService,
    SearchPostService,
  ],
})
export class PostUseCaseModule {}
