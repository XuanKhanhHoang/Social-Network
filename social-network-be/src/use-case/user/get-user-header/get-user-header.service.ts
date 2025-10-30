import { Injectable } from '@nestjs/common';
import { UserHeaderWithRelationship } from 'src/domains/user/interfaces';
import { UserService } from 'src/domains/user/user.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserHeaderInput {
  username: string;
  requestingUserId?: string;
}
@Injectable()
export class GetUserHeaderService extends BaseUseCaseService<
  GetUserHeaderInput,
  UserHeaderWithRelationship
> {
  constructor(private readonly userService: UserService) {
    super();
  }
  async execute(
    input: GetUserHeaderInput,
  ): Promise<UserHeaderWithRelationship> {
    const { username, requestingUserId } = input;
    return this.userService.getUserHeader(username, requestingUserId);
  }
}
