import { Injectable, BadRequestException } from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface UnblockUserInput {
  unblockerId: string;
  targetUserId: string;
}

export interface UnblockUserOutput {
  success: boolean;
  message: string;
}

@Injectable()
export class UnblockUserService extends BaseUseCaseService<
  UnblockUserInput,
  UnblockUserOutput
> {
  constructor(private readonly friendshipRepository: FriendshipRepository) {
    super();
  }

  async execute(input: UnblockUserInput): Promise<UnblockUserOutput> {
    const { unblockerId, targetUserId } = input;

    if (unblockerId === targetUserId) {
      throw new BadRequestException('Cannot unblock yourself');
    }

    const result = await this.friendshipRepository.unblockUser(
      unblockerId,
      targetUserId,
    );

    if (!result) {
      throw new BadRequestException('User is not blocked');
    }

    return {
      success: true,
      message: 'User unblocked successfully',
    };
  }
}
