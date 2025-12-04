import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from 'src/schemas/post.schema';
import { GetPostsService } from './get-posts/get-posts.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }])],
  providers: [GetPostsService],
  exports: [GetPostsService],
})
export class AdminPostUseCaseModule {}
