import { Module } from '@nestjs/common';
import { ChatModule } from 'src/domains/chat/chat.module';
import { FriendshipModule } from 'src/domains/friendship/friendship.module';
import { GetSuggestedMessagingUsersService } from './get-suggested-messaging-users/get-suggested-messaging-users.service';
import { SearchMessagingUsersService } from './search-messaging-users/search-messaging-users.service';

@Module({
  imports: [ChatModule, FriendshipModule],
  providers: [GetSuggestedMessagingUsersService, SearchMessagingUsersService],
  exports: [GetSuggestedMessagingUsersService, SearchMessagingUsersService],
})
export class ChatUseCaseModule {}
