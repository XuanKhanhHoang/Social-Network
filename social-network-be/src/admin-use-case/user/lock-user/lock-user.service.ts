import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from 'src/share/enums/user-status.enum';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type LockUserInput = string;
export type LockUserOutput = {
  _id: string;
  status: UserStatus;
};

@Injectable()
export class LockUserService extends BaseUseCaseService<
  LockUserInput,
  LockUserOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(userId: LockUserInput): Promise<LockUserOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let updatedUser;
    if (user.status === UserStatus.ACTIVE) {
      updatedUser = await this.userRepository.lock(userId);
    } else {
      updatedUser = await this.userRepository.unlock(userId);
    }

    return {
      _id: updatedUser._id.toString(),
      status: updatedUser.status as UserStatus,
    };
  }
}
