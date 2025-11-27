import { Injectable } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';

@Injectable()
export class CountUnreadNotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}
