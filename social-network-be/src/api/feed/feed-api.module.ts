import { Module } from '@nestjs/common';
import { FeedController } from './feed-api.controller';
import { FeedUseCaseModule } from 'src/use-case/feed/feed-use-case.module';

@Module({
  imports: [FeedUseCaseModule],
  controllers: [FeedController],
})
export class FeedApiModule {}
