import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { UserDocument } from 'src/schemas';
import { UserRole } from 'src/share/enums/user-role.enum';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type VerifyAdminInput = {
  userId: string;
};

export type VerifyAdminOutput = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

@Injectable()
export class VerifyAdminService extends BaseUseCaseService<
  VerifyAdminInput,
  VerifyAdminOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: VerifyAdminInput): Promise<VerifyAdminOutput> {
    const { userId } = input;

    const user = await this.userRepository.findLeanedById<UserDocument>(
      userId,
      {
        projection: '+role',
      },
    );

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Admin only.');
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
