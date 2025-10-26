import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema } from 'src/schemas';
import { MediaUploadModule } from 'src/media-upload/media-upload.module';
import { CommentService } from './services/comment.service';
import { PostModule } from 'src/post/post.module';
import { CommentRepository } from './services/comment-repository.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MediaUploadModule,
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
