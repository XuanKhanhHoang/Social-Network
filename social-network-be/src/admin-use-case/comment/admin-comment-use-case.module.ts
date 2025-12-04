import { Module } from '@nestjs/common';
import { CommentModule } from 'src/domains/comment/comment.module';
import { GetCommentsService } from './get-comments/get-comments.service';

@Module({
  imports: [CommentModule],
  providers: [GetCommentsService],
  exports: [GetCommentsService],
})
export class AdminCommentUseCaseModule {}
