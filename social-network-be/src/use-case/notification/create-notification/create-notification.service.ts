import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { CreateNotificationData } from 'src/domains/notification/interfaces';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';

export interface CreateNotificationInput extends CreateNotificationData {}
export type CreateNotificationOutput = NotificationDocument;

@Injectable()
export class CreateNotificationService extends BaseUseCaseService<
  CreateNotificationInput,
  CreateNotificationOutput
> {
  private readonly logger = new Logger(CreateNotificationService.name);

  constructor(private readonly notificationRepository: NotificationRepository) {
    super();
  }

  async execute(
    input: CreateNotificationInput,
  ): Promise<CreateNotificationOutput> {
    this.logger.log(`Creating notification for user ${input.receiver}`);
    return this.notificationRepository.createNotification(input);
  }
}
