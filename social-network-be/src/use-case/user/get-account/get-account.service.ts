import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { Gender } from 'src/share/enums';
import { UserRepository } from 'src/domains/user/user.repository';
import { PrivacySettings } from 'src/schemas';

export interface GetAccountInput {
  userId: string;
}

export interface GetAccountOutput {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  birthDate: Date;
  gender: Gender;
  privacy: PrivacySettings;
}

@Injectable()
export class GetAccountService extends BaseUseCaseService<
  GetAccountInput,
  GetAccountOutput
> {
  constructor(private readonly userRepo: UserRepository) {
    super();
  }

  async execute(input: GetAccountInput): Promise<GetAccountOutput> {
    const { userId } = input;

    const user = await this.userRepo.getAccount(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      birthDate: user.birthDate,
      gender: user.gender,
      privacy:
        user.privacySettings ||
        ({
          work: 'PUBLIC',
          currentLocation: 'PUBLIC',
          friendList: 'FRIENDS',
          province: 'FRIENDS',
          friendCount: 'FRIENDS',
        } as any),
    };
  }
}
