import { Module } from '@nestjs/common';
import {
  UserApiModule,
  PostApiModule,
  CommentApiModule,
  AuthApiModuleModule,
} from './';

@Module({
  imports: [
    PostApiModule,
    CommentApiModule,
    AuthApiModuleModule,
    UserApiModule,
  ],
})
export class ApiModule {}
