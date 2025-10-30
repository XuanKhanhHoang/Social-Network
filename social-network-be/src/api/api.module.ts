import { Module } from '@nestjs/common';
import {
  UserApiModule,
  PostApiModule,
  CommentApiModule,
  AuthApiModuleModule,
  MediaUploadApiModule,
} from './';

@Module({
  imports: [
    PostApiModule,
    CommentApiModule,
    AuthApiModuleModule,
    UserApiModule,
    MediaUploadApiModule,
  ],
})
export class ApiModule {}
