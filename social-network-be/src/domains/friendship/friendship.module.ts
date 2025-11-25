import { Module } from '@nestjs/common';
import { FriendshipRepository } from './friendship.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendshipSchema } from 'src/schemas/friendship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Friendship', schema: FriendshipSchema },
    ]),
  ],
  providers: [FriendshipRepository],
  exports: [FriendshipRepository],
})
export class FriendshipModule {}
