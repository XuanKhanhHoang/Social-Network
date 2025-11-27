import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import {
  FriendEvents,
  FriendRequestAcceptedEventPayload,
  UserEvents,
} from 'src/share/events';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { FriendshipStatus } from 'src/share/enums/friendship-status';
import { UserRepository } from 'src/domains/user/user.repository';

export interface AcceptFriendRequestInput {
  requesterId: string;
  recipientId: string;
}
export interface AcceptFriendRequestOutput {
  requester: {
    _id: string;
    username: string;
  };
  recipient: {
    _id: string;
    username: string;
  };
  status: FriendshipStatus;
}
@Injectable()
export class AcceptFriendRequestService extends BaseUseCaseService<
  AcceptFriendRequestInput,
  AcceptFriendRequestOutput
> {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly emitter: EventEmitter2,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(
    input: AcceptFriendRequestInput,
  ): Promise<AcceptFriendRequestOutput> {
    const { requesterId, recipientId } = input;

    const [requester, recipient] = await Promise.all([
      this.userRepository.getUsernameById(requesterId),
      this.userRepository.getUsernameById(recipientId),
    ]);
    const result = await this.friendshipRepository.acceptFriendRequest(
      requesterId,
      recipientId,
    );

    if (!result) {
      throw new BadRequestException(
        'Friend request not found or already accepted',
      );
    }
    this.emitter.emit(UserEvents.friendCountChanged, {
      userId: recipientId,
      newData: {
        friendCountDelta: 1,
      },
    });
    this.emitter.emit(FriendEvents.requestAccepted, {
      friendshipId: result._id.toString(),
      userId: recipientId,
      friendId: requesterId,
    } as FriendRequestAcceptedEventPayload);

    return {
      requester: {
        _id: requester._id.toString(),
        username: requester.username,
      },
      recipient: {
        _id: recipient._id.toString(),
        username: recipient.username,
      },
      status: result.status,
    };
  }
}
