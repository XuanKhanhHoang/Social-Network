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

@Module({
  imports: [
    PostApiModule,
    CommentApiModule,
    AuthApiModuleModule,
    UserApiModule,
    MediaUploadApiModule,
    ReactionApiModule,
    FeedApiModule,
    NotificationApiModule,
  ],
})
export class ApiModule {}
