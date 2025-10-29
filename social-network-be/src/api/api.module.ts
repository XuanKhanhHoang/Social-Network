import { Module } from '@nestjs/common';
import { PostApiModule } from './post/post.module';

@Module({
  imports: [PostApiModule],
})
export class ApiModule {}
