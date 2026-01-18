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
import { CheckUnreadMessagesService } from './check-unread-messages/check-unread-messages.service';
import { SearchConversationsService } from './search-conversations/search-conversations.service';
import { CreateGroupService } from './create-group/create-group.service';
import { UpdateGroupService } from './update-group/update-group.service';
import { AddGroupMemberService } from './add-group-member/add-group-member.service';
import { KickGroupMemberService } from './kick-group-member/kick-group-member.service';
import { LeaveGroupService } from './leave-group/leave-group.service';
import { GetGroupMembersService } from './get-group-members/get-group-members.service';
import { AssignGroupAdminService } from './assign-group-admin/assign-group-admin.service';
import { DeleteGroupService } from './delete-group/delete-group.service';

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
    CheckUnreadMessagesService,
    SearchConversationsService,
    CreateGroupService,
    UpdateGroupService,
    AddGroupMemberService,
    KickGroupMemberService,
    LeaveGroupService,
    GetGroupMembersService,
    AssignGroupAdminService,
    DeleteGroupService,
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
    CheckUnreadMessagesService,
    SearchConversationsService,
    CreateGroupService,
    UpdateGroupService,
    AddGroupMemberService,
    KickGroupMemberService,
    LeaveGroupService,
    GetGroupMembersService,
    AssignGroupAdminService,
    DeleteGroupService,
  ],
})
export class ChatUseCaseModule {}
