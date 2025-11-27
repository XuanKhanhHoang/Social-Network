import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';

export interface MarkReadNotificationInput {
  id: string;
}
export type MarkReadNotificationOutput = NotificationDocument;

@Injectable()
export class MarkReadNotificationService extends BaseUseCaseService<
  MarkReadNotificationInput,
  MarkReadNotificationOutput
> {
  private readonly logger = new Logger(MarkReadNotificationService.name);

  constructor(private readonly notificationRepository: NotificationRepository) {
    super();
  }

  async execute(
    input: MarkReadNotificationInput,
  ): Promise<MarkReadNotificationOutput> {
    const { id } = input;
    this.logger.log(`Marking notification ${id} as read`);
    const result = await this.notificationRepository.markAsRead(id);
    if (!result) {
      throw new NotFoundException('Notification not found');
    }
    return result;
  }
}
