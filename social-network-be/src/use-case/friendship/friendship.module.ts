import { Module } from '@nestjs/common';
import { FriendshipModule } from 'src/domains/friendship/friendship.module';
import { UserModule } from 'src/domains/user/user.module';
import { AcceptFriendRequestService } from './accept-friend-request-service/accept-friend-request-service.service';
import { RemoveFriendService } from './remove-friend-service/remove-friend-service.service';
import { GetReceiveFriendRequestsService } from './get-receive-friend-requests-service/get-receive-friend-requests-service.service';
import { SendFriendRequestService } from './send-friend-request-service/send-friend-request-service.service';
import { GetSentFriendRequestsService } from './get-sent-friend-requests-service/get-sent-friend-requests.service';
import { GetSuggestFriendsService } from '../user';

import { GetBlockedUsersService } from './get-blocked-users-service/get-blocked-users.service';

import { CancelFriendRequestService } from './cancel-friend-request-service/cancel-friend-request-service.service';

import { BlockUserService } from './block-user-service/block-user-service.service';

import { UnblockUserService } from './unblock-user-service/unblock-user-service.service';

@Module({
  imports: [FriendshipModule, UserModule],
  providers: [
    SendFriendRequestService,
    AcceptFriendRequestService,
    RemoveFriendService,
    GetReceiveFriendRequestsService,
    GetSuggestFriendsService,
    GetSentFriendRequestsService,
    GetBlockedUsersService,
    CancelFriendRequestService,
    BlockUserService,
    UnblockUserService,
  ],
  exports: [
    SendFriendRequestService,
    AcceptFriendRequestService,
    RemoveFriendService,
    GetReceiveFriendRequestsService,
    GetSuggestFriendsService,
    GetSentFriendRequestsService,
    GetBlockedUsersService,
    CancelFriendRequestService,
    BlockUserService,
    UnblockUserService,
  ],
})
export class FriendshipUseCaseModule {}
