import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/domains/notification/notification.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { UserModule } from 'src/domains/user/user.module';
import {
  CreateNotificationService,
  GetNotificationsService,
  MarkReadNotificationService,
  CountUnreadNotificationsService,
  MarkReadAllNotificationService,
} from './';
import { NotificationEventListener } from './listeners/listeners.service';

import { FriendshipModule } from 'src/domains/friendship/friendship.module';

@Module({
  imports: [NotificationModule, UserModule, GatewayModule, FriendshipModule],
  providers: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
    CountUnreadNotificationsService,
    MarkReadAllNotificationService,
    NotificationEventListener,
  ],
  exports: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
    CountUnreadNotificationsService,
    MarkReadAllNotificationService,
  ],
})
export class NotificationUseCaseModule {}
