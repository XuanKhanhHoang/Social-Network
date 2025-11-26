import { Module } from '@nestjs/common';
import { NotificationModule } from 'src/domains/notification/notification.module';
import {
  CreateNotificationService,
  GetNotificationsService,
  MarkReadNotificationService,
} from './';

@Module({
  imports: [NotificationModule],
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
