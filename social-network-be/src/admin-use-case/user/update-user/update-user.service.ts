import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UpdateQuery } from 'mongoose';
import { UserRepository } from 'src/domains/user/user.repository';
import { UserDocument } from 'src/schemas';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type UpdateUserInput = {
  userId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  isVerified?: boolean;
  password?: string;
};

export type UpdateUserOutput = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isVerified: boolean;
};

@Injectable()
export class UpdateUserService extends BaseUseCaseService<
  UpdateUserInput,
  UpdateUserOutput
> {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const { userId, ...updateData } = input;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        username: updateData.username,
        _id: { $ne: userId },
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatePayload: UpdateQuery<UserDocument> = {
      $set: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        username: updateData.username,
        email: updateData.email,
        isVerified: updateData.isVerified,
      },
    };

    if (updateData.password) {
      updatePayload.password = await bcrypt.hash(
        updateData.password,
        +process.env.PASSWORD_HASH_ROUND || 10,
      );
    }

    const updatedUser = await this.userRepository.updateByIdAndGet(
      userId,
      updatePayload,
    );

    return {
      _id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
    };
  }
}
