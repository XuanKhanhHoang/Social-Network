import { Module } from '@nestjs/common';
import { AuthApiModule } from './auth/auth-api.module';
import { UserApiModule } from './user/user-api.module';
import { PostApiModule } from './post/post-api.module';
import { CommentApiModule } from './comment/comment-api.module';
import { ReactionApiModule } from './reaction/reaction-api.module';
import { FriendshipApiModule } from './friendship/friendship-api.module';
import { FeedApiModule } from './feed/feed-api.module';
import { NotificationApiModule } from './notification/notification-api.module';
import { MediaUploadApiModule } from './media-upload/media-upload-api.module';
import { ChatApiModule } from './chat/chat-api.module';
import { ReportApiModule } from './report/report-api.module';

@Module({
  imports: [
    AuthApiModule,
    UserApiModule,
    PostApiModule,
    CommentApiModule,
    ReactionApiModule,
    FriendshipApiModule,
    FeedApiModule,
    NotificationApiModule,
    MediaUploadApiModule,
    ChatApiModule,
    ReportApiModule,
  ],
})
export class ApiModule {}
