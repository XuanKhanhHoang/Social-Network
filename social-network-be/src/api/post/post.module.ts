import { Module } from '@nestjs/common';
import { PostUseCaseModule } from 'src/use-case/post/post.use-case.module';
import { PostController } from './post.controller';

@Module({
  imports: [PostUseCaseModule],
  controllers: [PostController],
})
export class PostApiModule {}
