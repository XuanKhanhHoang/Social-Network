import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';

export interface GetNotificationsInput {
  userId: string;
  limit: number;
  skip: number;
}
export type GetNotificationsOutput = NotificationDocument[];

@Injectable()
export class GetNotificationsService extends BaseUseCaseService<
  GetNotificationsInput,
  GetNotificationsOutput
> {
  private readonly logger = new Logger(GetNotificationsService.name);

  constructor(private readonly notificationRepository: NotificationRepository) {
    super();
  }

  async execute(input: GetNotificationsInput): Promise<GetNotificationsOutput> {
    const { userId, limit, skip } = input;
    this.logger.log(`Fetching notifications for user ${userId}`);
    return this.notificationRepository.findForUser(userId, limit, skip);
  }
}
