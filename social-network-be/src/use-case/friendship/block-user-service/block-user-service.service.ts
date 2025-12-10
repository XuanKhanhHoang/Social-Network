import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface BlockUserInput {
  blockerId: string;
  targetUserId: string;
}

export interface BlockUserOutput {
  success: boolean;
  message: string;
}

@Injectable()
export class BlockUserService extends BaseUseCaseService<
  BlockUserInput,
  BlockUserOutput
> {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(input: BlockUserInput): Promise<BlockUserOutput> {
    const { blockerId, targetUserId } = input;

    if (blockerId === targetUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

    const targetUser = await this.userRepository.getUsernameById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existingRelationship =
      await this.friendshipRepository.findRelationship(blockerId, targetUserId);

    if (existingRelationship) {
      throw new BadRequestException(
        'Cannot block user with existing relationship. Please remove the relationship first.',
      );
    }

    await this.friendshipRepository.blockUser(blockerId, targetUserId);

    return {
      success: true,
      message: 'User blocked successfully',
    };
  }
}
