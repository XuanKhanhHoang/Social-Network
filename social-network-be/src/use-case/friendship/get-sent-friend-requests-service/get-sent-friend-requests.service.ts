import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { FriendshipDocumentModelWithPopulatedUser } from 'src/domains/friendship/interfaces';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetSentFriendRequestsInput {
  userId: string;
  limit?: number;
  cursor?: number;
}

export interface GetSentFriendRequestsOutput
  extends BeCursorPaginated<
    FriendshipDocumentModelWithPopulatedUser<Types.ObjectId>
  > {}

@Injectable()
export class GetSentFriendRequestsService extends BaseUseCaseService<
  GetSentFriendRequestsInput,
  GetSentFriendRequestsOutput
> {
  constructor(private readonly friendshipRepository: FriendshipRepository) {
    super();
  }

  async execute(
    input: GetSentFriendRequestsInput,
  ): Promise<GetSentFriendRequestsOutput> {
    const { userId, limit = 10, cursor } = input;
    const skip = cursor || 0;

    const requests = await this.friendshipRepository.getSentRequests(
      userId,
      limit,
      skip,
    );

    const nextCursor = requests.length === limit ? skip + limit : null;

    return {
      data: requests,
      pagination: {
        hasMore: nextCursor !== null,
        nextCursor: nextCursor ? nextCursor.toString() : null,
      },
    };
  }
}
