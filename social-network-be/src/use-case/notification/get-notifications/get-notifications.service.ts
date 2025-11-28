import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';

export interface GetNotificationsInput {
  userId: string;
  limit: number;
  cursor?: string;
}
export type GetNotificationsOutput = BeCursorPaginated<
  Omit<NotificationDocument, 'relatedId'> & {
    relatedId: any;
  }
>;

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
    const { userId, limit, cursor } = input;
    this.logger.log(`Fetching notifications for user ${userId}`);
    const { data, nextCursor } = await this.notificationRepository.findForUser(
      userId,
      limit,
      cursor,
    );
    return {
      data,
      pagination: {
        nextCursor,
        hasMore: !!nextCursor,
      },
    };
  }
}
