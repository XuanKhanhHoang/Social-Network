import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { Post, PostSchema } from 'src/schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaUploadModule } from 'src/media-upload/media-upload.module';
import { CommentModule } from 'src/comment/comment.module';
import { PostService } from './services/post.service';
import { PostRepository } from './services/post-repository.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MediaUploadModule,
    CommentModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostService],
})
export class PostModule {}
