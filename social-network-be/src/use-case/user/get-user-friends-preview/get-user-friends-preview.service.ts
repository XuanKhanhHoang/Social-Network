import { Injectable } from '@nestjs/common';
import { PopulatedFriend } from 'src/domains/user/interfaces';
import { UserService } from 'src/domains/user/user.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserFriendsPreviewInput {
  username: string;
  requesting?: string;
  limit?: number;
  page?: number;
}
export interface GetUserFriendsPreviewOutput {
  total: number;
  data: PopulatedFriend[];
  pagination: {
    hasNextPage: boolean;
  };
}

@Injectable()
export class GetUserFriendsPreviewService extends BaseUseCaseService<
  GetUserFriendsPreviewInput,
  GetUserFriendsPreviewOutput
> {
  constructor(private readonly userService: UserService) {
    super();
  }
  async execute(
    input: GetUserFriendsPreviewInput,
  ): Promise<GetUserFriendsPreviewOutput> {
    const { username, requesting, limit, page } = input;
    return this.userService.getFriendsPreview(
      username,
      requesting,
      limit,
      page,
    );
  }
}
