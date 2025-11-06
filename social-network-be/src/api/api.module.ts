import { Module } from '@nestjs/common';
import {
  UserApiModule,
  PostApiModule,
  CommentApiModule,
  AuthApiModuleModule,
  MediaUploadApiModule,
} from './';
import { ReactionApiModule } from './reaction/reaction-api.module';

@Module({
  imports: [
    PostApiModule,
    CommentApiModule,
    AuthApiModuleModule,
    UserApiModule,
    MediaUploadApiModule,
    ReactionApiModule,
  ],
})
export class ApiModule {}
