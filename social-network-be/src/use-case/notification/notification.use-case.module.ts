import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/domains/notification/notification.module';
import { NotificationGatewayModule } from 'src/gateway/notification-gateway.module';
import { UserModule } from 'src/domains/user/user.module';
import {
  CreateNotificationService,
  GetNotificationsService,
  MarkReadNotificationService,
  CountUnreadNotificationsService,
} from './';
import { NotificationEventListener } from './listeners/listeners.service';

import { FriendshipModule } from 'src/domains/friendship/friendship.module';

@Module({
  imports: [
    NotificationModule,
    UserModule,
    NotificationGatewayModule,
    FriendshipModule,
  ],
  providers: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
    CountUnreadNotificationsService,
    NotificationEventListener,
  ],
  exports: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
    CountUnreadNotificationsService,
  ],
})
export class NotificationUseCaseModule {}
