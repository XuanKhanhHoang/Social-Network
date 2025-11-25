import { Injectable, NotFoundException } from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEvents } from 'src/share/events';
import { UserRepository } from 'src/domains/user/user.repository';

export interface RemoveFriendInput {
  userId: string;
  targetUserId: string;
}
export interface RemoveFriendOutput {
  recipient: {
    _id: string;
    username: string;
  };
  requester: {
    _id: string;
    username: string;
  };
}
@Injectable()
export class RemoveFriendService extends BaseUseCaseService<
  RemoveFriendInput,
  RemoveFriendOutput
> {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly emitter: EventEmitter2,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(input: RemoveFriendInput): Promise<RemoveFriendOutput> {
    const { userId, targetUserId } = input;

    const [requester, recipient] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.findById(targetUserId),
    ]);
    const result = await this.friendshipRepository.removeFriendship(
      userId,
      targetUserId,
    );

    if (!result) {
      throw new NotFoundException('Relationship not found');
    }
    this.emitter.emit(UserEvents.friendCountChanged, {
      userId,
      newData: {
        friendCountDelta: -1,
      },
    });
    return {
      recipient: {
        _id: recipient._id.toString(),
        username: recipient.username,
      },
      requester: {
        _id: requester._id.toString(),
        username: requester.username,
      },
    };
  }
}
