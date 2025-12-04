import { Module } from '@nestjs/common';
import { AdminPostApiController } from './admin-post-api.controller';
import { AdminPostUseCaseModule } from 'src/admin-use-case/post/admin-post-use-case.module';

@Module({
  imports: [AdminPostUseCaseModule],
  controllers: [AdminPostApiController],
})
export class AdminPostApiModule {}
