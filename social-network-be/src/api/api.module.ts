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
import { NotificationApiModule } from './notification/notification-api.module';
import { FriendshipApiModule } from './friendship/friendship-api.module';
import { ChatApiModule } from './chat/chat-api.module';

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
    NotificationApiModule,
    ChatApiModule,
  ],
})
export class ApiModule {}
