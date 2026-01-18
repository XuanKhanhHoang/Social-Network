import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from 'src/domains/notification/notification.repository';
import { CreateNotificationData } from 'src/domains/notification/interfaces';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { NotificationDocument } from 'src/schemas/notification.schema';
import { AppGateway } from 'src/gateway/app.gateway';
import { UserRepository } from 'src/domains/user/user.repository';
import { SocketEvents } from 'src/share/constants/socket.constant';

const SYSTEM_SENDER = {
  _id: '000000000000000000000000',
  username: 'system',
  firstName: 'thống',
  lastName: 'Hệ',
  avatar: '/logo.svg',
};

export interface CreateNotificationInput
  extends Omit<CreateNotificationData, 'sender'> {
  sender?: {
    _id: string | null;
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
    let senderData = SYSTEM_SENDER;

    if (input.sender?._id) {
      const sender = await this.userRepository.findByIdBasic(input.sender._id);
      if (sender) {
        senderData = {
          _id: sender._id as any,
          username: sender.username,
          firstName: sender.firstName,
          lastName: sender.lastName,
          avatar: sender.avatar?.url,
        };
      }
    }

    const notificationData: CreateNotificationData = {
      ...input,
      sender: senderData as any,
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
