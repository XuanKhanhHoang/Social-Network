import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type GetUserDetailInput = string;

export type GetUserDetailOutput = {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: any;
  coverPhoto: any;
  bio: string;
  gender: string;
  birthDate: Date;
  phoneNumber: string;
  work: string;
  currentLocation: string;
  provinceCode: string;
  role: string;
  status: string;
  isVerified: boolean;
  friendCount: number;
  createdAt: Date;
  deletedAt?: Date;
};

@Injectable()
export class GetUserDetailService extends BaseUseCaseService<
  GetUserDetailInput,
  GetUserDetailOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(userId: GetUserDetailInput): Promise<GetUserDetailOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      gender: user.gender,
      birthDate: user.birthDate,
      phoneNumber: user.phoneNumber,
      work: user.work,
      currentLocation: user.currentLocation,
      provinceCode: user.provinceCode,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      friendCount: user.friendCount,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt,
    };
  }
}
