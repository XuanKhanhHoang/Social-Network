import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { FriendshipStatus } from 'src/share/enums/friendship-status';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendEvents, FriendRequestSentEventPayload } from 'src/share/events';

export interface SendFriendRequestInput {
  requesterId: string;
  recipientId: string;
}
export interface SendFriendRequestOutput {
  recipient: {
    _id: string;
    username: string;
  };
  requester: {
    _id: string;
  };
  status: FriendshipStatus;
}

@Injectable()
export class SendFriendRequestService extends BaseUseCaseService<
  SendFriendRequestInput,
  SendFriendRequestOutput
> {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async execute(
    input: SendFriendRequestInput,
  ): Promise<SendFriendRequestOutput> {
    const { requesterId, recipientId } = input;

    if (requesterId === recipientId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const recipientExists =
      await this.userRepository.getUsernameById(recipientId);
    if (!recipientExists) {
      throw new NotFoundException('Recipient user not found');
    }

    const existingRelationship =
      await this.friendshipRepository.findRelationship(
        requesterId,
        recipientId,
      );

    if (existingRelationship) {
      throw new BadRequestException('Relationship already exists');
    }

    const result = await this.friendshipRepository.createFriendRequest(
      requesterId,
      recipientId,
    );

    this.eventEmitter.emit(FriendEvents.requestSent, {
      requestId: result._id.toString(),
      senderId: requesterId,
      receiverId: recipientId,
    } as FriendRequestSentEventPayload);

    return {
      recipient: {
        _id: recipientId,
        username: recipientExists.username,
      },
      requester: {
        _id: requesterId,
      },
      status: FriendshipStatus.PENDING,
    };
  }
}
