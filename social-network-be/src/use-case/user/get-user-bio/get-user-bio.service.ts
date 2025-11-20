import { Injectable } from '@nestjs/common';
import { UserBioModel } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserBioInput {
  username: string;
  requestingUserId?: string;
}
export interface GetUserBioOutput {
  bio?: string;
  work?: string;
  currentLocation?: string;
}

@Injectable()
export class GetUserBioService extends BaseUseCaseService<
  GetUserBioInput,
  GetUserBioOutput
> {
  constructor(private readonly userDomainsService: UserDomainsService) {
    super();
  }
  async execute(input: GetUserBioInput): Promise<GetUserBioOutput> {
    const { username, requestingUserId } = input;
    const { profileUser, isOwner, isFriend } =
      await this.userDomainsService.getProfileAndRelationship(
        username,
        requestingUserId,
      );

    const settings = profileUser.privacySettings;
    const response: Partial<UserBioModel> = {
      bio: profileUser.bio,
    };

    if (this.userDomainsService.canView(settings.work, isOwner, isFriend)) {
      response.work = profileUser.work;
    }
    if (
      this.userDomainsService.canView(
        settings.currentLocation,
        isOwner,
        isFriend,
      )
    ) {
      response.currentLocation = profileUser.currentLocation;
    }

    return response;
  }
}
