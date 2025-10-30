import { Injectable } from '@nestjs/common';
import { UserProfileResponse } from 'src/domains/user/interfaces';
import { UserService } from 'src/domains/user/user.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserProfileInput {
  username: string;
  requestingUserId?: string;
}
@Injectable()
export class GetUserProfileService extends BaseUseCaseService<
  GetUserProfileInput,
  UserProfileResponse
> {
  constructor(private readonly userService: UserService) {
    super();
  }
  async execute(input: GetUserProfileInput): Promise<UserProfileResponse> {
    const { username, requestingUserId } = input;
    return this.userService.getProfileByUsername(username, requestingUserId);
  }
}
