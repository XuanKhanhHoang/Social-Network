import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordRequestDto } from 'src/api/auth/dto/change-password.dto';
import { UserRepository } from 'src/domains/user/user.repository';

@Injectable()
export class ChangePasswordService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, dto: ChangePasswordRequestDto): Promise<void> {
    const { oldPassword, newPassword, confirmNewPassword } = dto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'Old password and new password do not match',
      );
    }

    const user = await this.userRepository.findOne(
      { _id: userId },
      { projection: '+password' },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Old password is not correct');
    }

    if (oldPassword === newPassword) {
      throw new ConflictException('New password is the same as old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.updateById(userId, {
      password: hashedPassword,
    });
  }
}
