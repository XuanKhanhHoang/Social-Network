import { Injectable } from '@nestjs/common';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserHeaderInput {
  username: string;
  requestingUserId?: string;
}
export interface GetUserHeaderOutput {}
@Injectable()
export class GetUserHeaderService extends BaseUseCaseService<
  GetUserHeaderInput,
  GetUserHeaderOutput
> {
  constructor(private readonly userDomainService: UserDomainsService) {
    super();
  }
  async execute(input: GetUserHeaderInput): Promise<GetUserHeaderOutput> {
    const { username, requestingUserId } = input;
    const { profileUser, relationship, friendCount } =
      await this.userDomainService.getProfileAndRelationship(
        username,
        requestingUserId,
      );
    if (friendCount != undefined) {
      return {
        firstName: profileUser.firstName,
        lastName: profileUser.lastName,
        username: profileUser.username,
        avatar: profileUser.avatar,
        coverPhoto: profileUser.coverPhoto,
        relationship: relationship,
        friendCount: friendCount,
      };
    }
    return {
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      username: profileUser.username,
      avatar: profileUser.avatar,
      coverPhoto: profileUser.coverPhoto,
      relationship: relationship,
    };
  }
}
