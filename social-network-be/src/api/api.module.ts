import { Module } from '@nestjs/common';
import {
  UserApiModule,
  PostApiModule,
  CommentApiModule,
  AuthApiModuleModule,
  MediaUploadApiModule,
} from './';
import { ReactionApiModule } from './reaction/reaction-api.module';
import { FeedApiModule } from './feed/feed-api.module';
import { FriendshipApiModule } from './friendship/friendship-api.module';

@Module({
  imports: [
    FriendshipApiModule,
    PostApiModule,
    CommentApiModule,
    AuthApiModuleModule,
    UserApiModule,
    MediaUploadApiModule,
    ReactionApiModule,
    FeedApiModule,
  ],
})
export class ApiModule {}
