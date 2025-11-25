import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserMinimalModel } from 'src/domains/user/interfaces';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetReceiveFriendRequestsInput {
  userId: string;
  limit?: number;
  cursor?: number;
}

export interface GetReceiveFriendRequestsOutput
  extends BeCursorPaginated<UserMinimalModel<Types.ObjectId>> {}

@Injectable()
export class GetReceiveFriendRequestsService extends BaseUseCaseService<
  GetReceiveFriendRequestsInput,
  GetReceiveFriendRequestsOutput
> {
  constructor(private readonly friendshipRepository: FriendshipRepository) {
    super();
  }

  async execute(
    input: GetReceiveFriendRequestsInput,
  ): Promise<GetReceiveFriendRequestsOutput> {
    const { userId, limit = 10, cursor } = input;
    const skip = cursor || 0;

    const requests = await this.friendshipRepository.getPendingRequests(
      userId,
      limit,
      skip,
    );

    const data = requests.map(
      (req) => req.requester as unknown as UserMinimalModel<Types.ObjectId>,
    );

    const nextCursor = requests.length === limit ? skip + limit : null;

    return {
      data,
      pagination: {
        hasMore: nextCursor !== null,
        nextCursor: nextCursor ? nextCursor.toString() : null,
      },
    };
  }
}
