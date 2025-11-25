import { Injectable, NotFoundException } from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { UserRepository } from 'src/domains/user/user.repository';
export interface CancelFriendRequestInput {
  userId: string;
  targetUserId: string;
}

export interface CancelFriendRequestOutput {
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
export class CancelFriendRequestService extends BaseUseCaseService<
  CancelFriendRequestInput,
  CancelFriendRequestOutput
> {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(
    input: CancelFriendRequestInput,
  ): Promise<CancelFriendRequestOutput> {
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
      throw new NotFoundException('Friend request not found');
    }

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
