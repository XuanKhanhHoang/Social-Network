import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type DeleteUserInput = string;
export type DeleteUserOutput = {
  _id: string;
  deletedAt: Date;
};

@Injectable()
export class DeleteUserService extends BaseUseCaseService<
  DeleteUserInput,
  DeleteUserOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(userId: DeleteUserInput): Promise<DeleteUserOutput> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestException('User already deleted');
    }

    const deletedUser = await this.userRepository.softDelete(userId);

    return {
      _id: deletedUser._id.toString(),
      deletedAt: deletedUser.deletedAt,
    };
  }
}
