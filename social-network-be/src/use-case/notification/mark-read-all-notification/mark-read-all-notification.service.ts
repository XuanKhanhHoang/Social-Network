import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

@Injectable()
export class MarkReadAllNotificationService extends BaseUseCaseService<
  string,
  void
> {
  private readonly logger = new Logger(MarkReadAllNotificationService.name);

  constructor(private readonly notificationRepository: NotificationRepository) {
    super();
  }

  async execute(userId: string): Promise<void> {
    this.logger.log(`Marking all notifications as read for user ${userId}`);
    return this.notificationRepository.markAllAsRead(userId);
  }
}
