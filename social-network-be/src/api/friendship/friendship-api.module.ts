import { Module } from '@nestjs/common';
import { FriendshipUseCaseModule } from 'src/use-case/friendship/friendship.module';
import { FriendshipApiController } from './friendship-api.controller';

@Module({
  imports: [FriendshipUseCaseModule],
  controllers: [FriendshipApiController],
})
export class FriendshipApiModule {}
