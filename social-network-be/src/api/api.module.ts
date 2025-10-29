import { Module } from '@nestjs/common';
import { PostApiModule } from './post/post.module';
import { CommentApiModule } from './comment/comment.module';
import { AuthApiModuleModule } from './auth/auth.module';

@Module({
  imports: [PostApiModule, CommentApiModule, AuthApiModuleModule],
})
export class ApiModule {}
