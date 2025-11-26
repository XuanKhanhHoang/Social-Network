import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/domains/notification/notification.module';
import { NotificationGatewayModule } from 'src/gateway/notification-gateway.module';
import {
  CreateNotificationService,
  GetNotificationsService,
  MarkReadNotificationService,
} from './';

@Module({
  imports: [NotificationModule, NotificationGatewayModule],
  providers: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
  ],
  exports: [
    CreateNotificationService,
    GetNotificationsService,
    MarkReadNotificationService,
  ],
})
export class NotificationUseCaseModule {}
