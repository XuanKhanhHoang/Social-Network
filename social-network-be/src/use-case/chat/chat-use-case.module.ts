import { Module } from '@nestjs/common';
import { ChatModule } from 'src/domains/chat/chat.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { MediaUploadModule } from 'src/domains/media-upload/media-upload.module';
import { UserModule } from 'src/domains/user/user.module';
import { SendMessageService } from './send-message/send-message.service';
import { GetConversationsService } from './get-conversations/get-conversations.service';
import { GetMessagesService } from './get-messages/get-messages.service';
import { GetSuggestedMessagingUsersService } from './get-suggested-messaging-users/get-suggested-messaging-users.service';
import { SearchMessagingUsersService } from './search-messaging-users/search-messaging-users.service';
import { GetConversationByUserService } from './get-conversation-by-user/get-conversation-by-user.service';
import { FriendshipModule } from 'src/domains/friendship/friendship.module';
import { MarkMessageAsReadService } from './mark-message-as-read/mark-message-as-read.service';
import { CleanupRecalledMessagesService } from './cleanup-recalled-messages/cleanup-recalled-messages.service';
import { RecallMessageService } from './recall-message/recall-message.service';

@Module({
  imports: [
    ChatModule,
    GatewayModule,
    MediaUploadModule,
    UserModule,
    FriendshipModule,
  ],
  providers: [
    SendMessageService,
    GetConversationsService,
    GetMessagesService,
    GetSuggestedMessagingUsersService,
    SearchMessagingUsersService,
    GetConversationByUserService,
    MarkMessageAsReadService,
    CleanupRecalledMessagesService,
    RecallMessageService,
  ],
  exports: [
    SendMessageService,
    GetConversationsService,
    GetMessagesService,
    GetSuggestedMessagingUsersService,
    SearchMessagingUsersService,
    GetConversationByUserService,
    MarkMessageAsReadService,
    RecallMessageService,
  ],
})
export class ChatUseCaseModule {}
