import { Module } from '@nestjs/common';
import { AdminCommentApiController } from './admin-comment-api.controller';
import { AdminCommentUseCaseModule } from 'src/admin-use-case/comment/admin-comment-use-case.module';

@Module({
  imports: [AdminCommentUseCaseModule],
  controllers: [AdminCommentApiController],
})
export class AdminCommentApiModule {}
