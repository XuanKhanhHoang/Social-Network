import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserMinimalModel } from 'src/domains/user/interfaces';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetBlockedUsersInput {
  userId: string;
  limit?: number;
  cursor?: number;
}

export interface GetBlockedUsersOutput
  extends BeCursorPaginated<UserMinimalModel<Types.ObjectId>> {}

@Injectable()
export class GetBlockedUsersService extends BaseUseCaseService<
  GetBlockedUsersInput,
  GetBlockedUsersOutput
> {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async execute(input: GetBlockedUsersInput): Promise<GetBlockedUsersOutput> {
    const { userId, limit = 10, cursor } = input;

    const { blockedUserIds, nextCursor } =
      await this.friendshipRepository.findBlockedUsers({
        userId,
        limit,
        cursor,
      });

    let blockedUsers: UserMinimalModel<Types.ObjectId>[] = [];

    if (blockedUserIds.length > 0) {
      blockedUsers = await this.userRepository.findManyByIds(blockedUserIds);
      // Preserve order if needed, but findManyByIds might not guarantee it.
      // Mapping back to ensure order if critical, but for blocked list usually not critical.
    }

    return {
      data: blockedUsers,
      pagination: {
        hasMore: nextCursor !== null,
        nextCursor: nextCursor !== null ? String(nextCursor) : null,
      },
    };
  }
}
