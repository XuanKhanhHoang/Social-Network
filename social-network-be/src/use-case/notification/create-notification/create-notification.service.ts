import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { CreateNotificationData } from 'src/domains/notification/interfaces';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import { UserRepository } from 'src/domains/user/user.repository';

export interface CreateNotificationInput
  extends Omit<CreateNotificationData, 'sender'> {
  sender: {
    _id: string;
  };
}
export type CreateNotificationOutput = NotificationDocument;

@Injectable()
export class CreateNotificationService extends BaseUseCaseService<
  CreateNotificationInput,
  CreateNotificationOutput
> {
  private readonly logger = new Logger(CreateNotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(
    input: CreateNotificationInput,
  ): Promise<CreateNotificationOutput> {
    this.logger.log(`Creating notification for user ${input.receiver}`);

    const sender = await this.userRepository.findByIdBasic(input.sender._id);
    if (!sender) {
      this.logger.warn(`Sender not found: ${input.sender._id}`);
      return null;
    }

    const notificationData: CreateNotificationData = {
      ...input,
      sender: {
        _id: sender._id,
        username: sender.username,
        firstName: sender.firstName,
        lastName: sender.lastName,
        avatar: sender.avatar?.mediaId?.toString(),
      },
    };

    const notification =
      await this.notificationRepository.createNotification(notificationData);

    this.notificationGateway.sendToUser(
      input.receiver.toString(),
      notification,
    );

    return notification;
  }
}
