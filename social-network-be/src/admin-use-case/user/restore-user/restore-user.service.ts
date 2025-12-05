import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type RestoreUserInput = string;
export type RestoreUserOutput = {
  _id: string;
  deletedAt: null;
};

@Injectable()
export class RestoreUserService extends BaseUseCaseService<
  RestoreUserInput,
  RestoreUserOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(userId: RestoreUserInput): Promise<RestoreUserOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    const restoredUser = await this.userRepository.restore(userId);

    return {
      _id: restoredUser._id.toString(),
      deletedAt: null,
    };
  }
}
