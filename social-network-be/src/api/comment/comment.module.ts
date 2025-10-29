import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentUseCaseModule } from 'src/use-case/comment/comment.use-case.module.';

@Module({
  imports: [CommentUseCaseModule],
  controllers: [CommentController],
})
export class CommentApiModule {}
