import { Injectable } from '@nestjs/common';
import { UserHeaderWithRelationship } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
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
  constructor(private readonly userDomainService: UserDomainsService) {
    super();
  }
  async execute(
    input: GetUserHeaderInput,
  ): Promise<UserHeaderWithRelationship> {
    const { username, requestingUserId } = input;
    const { profileUser, relationship } =
      await this.userDomainService.getProfileAndRelationship(
        username,
        requestingUserId,
      );

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
