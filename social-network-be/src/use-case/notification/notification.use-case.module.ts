import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/domains/notification/notification.module';
import { NotificationGatewayModule } from 'src/gateway/notification-gateway.module';
import { UserModule } from 'src/domains/user/user.module';
import {
  CreateNotificationService,
  GetNotificationsService,
  MarkReadNotificationService,
} from './';
import { NotificationEventListener } from './listeners/listeners.service';

@Module({
  imports: [NotificationModule, UserModule, NotificationGatewayModule],
  providers: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
    NotificationEventListener,
  ],
  exports: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
  ],
})
export class NotificationUseCaseModule {}
