import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { CreateNotificationData } from 'src/domains/notification/interfaces';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';
import { AppGateway } from 'src/gateway/app.gateway';
import { UserRepository } from 'src/domains/user/user.repository';
import { SocketEvents } from 'src/share/constants/socket.constant';

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
    private readonly appGateway: AppGateway,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(
    input: CreateNotificationInput,
  ): Promise<CreateNotificationOutput> {
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
        avatar: sender.avatar?.url,
      },
    };

    const notification =
      await this.notificationRepository.createNotification(notificationData);

    this.appGateway.emitToUser(
      notification.receiver._id.toString(),
      SocketEvents.NEW_NOTIFICATION,
      notification,
    );

    return notification;
  }
}
