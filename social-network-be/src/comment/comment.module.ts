import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema, Post, PostSchema } from 'src/schemas';
import { CommentService } from './comment.service';
import { MediaUploadModule } from 'src/media-upload/media-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    MediaUploadModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
