import { Injectable } from '@nestjs/common';
import { UserBio } from 'src/domains/user/interfaces';
import { UserService } from 'src/domains/user/user.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserBioInput {
  username: string;
  requestingUserId?: string;
}
export interface GetUserBioOutput extends UserBio {}

@Injectable()
export class GetUserBioService extends BaseUseCaseService<
  GetUserBioInput,
  GetUserBioOutput
> {
  constructor(private readonly userService: UserService) {
    super();
  }
  async execute(input: GetUserBioInput): Promise<GetUserBioOutput> {
    const { username, requestingUserId } = input;
    return this.userService.getUserBio(username, requestingUserId);
  }
}
