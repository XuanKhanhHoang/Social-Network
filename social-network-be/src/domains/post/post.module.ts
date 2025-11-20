import { Module } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { PostDocument, PostSchema } from 'src/schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
    ]),
  ],
  providers: [PostRepository],
  exports: [PostRepository],
})
export class PostModule {}
