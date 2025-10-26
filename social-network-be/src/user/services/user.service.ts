import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RegisterDto } from 'src/auth/dtos/req/register.dto';
import { User } from 'src/schemas';
import { UserRepository } from './user-repository.service';
import { CreateUserData, UserBasicData } from '../interfaces';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const { birthDate, firstName, gender, lastName, email, password } =
      registerDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await this.generateUniqueUsername(firstName, lastName);

    const userPayload: CreateUserData = {
      firstName,
      email,
      password: hashedPassword,
      lastName,
      gender,
      birthDate,
      isVerified: false,
      username,
    };

    return this.userRepository.createUser(userPayload);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailAndVerified(email: string): Promise<User | null> {
    return this.userRepository.findByEmailAndVerified(email);
  }

  async findByIdBasic(userId: string): Promise<UserBasicData | null> {
    return this.userRepository.findByIdBasic(userId);
  }

  async markUserAsVerified(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    user.isVerified = true;
    return this.userRepository.save(user);
  }

  private async generateUniqueUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const baseUsername = (firstName + lastName)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

    let username = baseUsername;
    let isUnique = false;
    let attempt = 0;

    while (!isUnique) {
      if (attempt > 0) {
        const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
        username = baseUsername + randomSuffix;
      }
      const existingUser = await this.userRepository.findByUsername(username);

      if (!existingUser) {
        isUnique = true;
      }
      attempt++;
      if (attempt > 10) {
        throw new Error('Cannot generate unique username');
      }
    }
    return username;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnverifiedAccounts() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deleteCriteria = {
      isVerified: false,
      createdAt: { $lt: twentyFourHoursAgo },
    };

    const { deletedCount } =
      await this.userRepository.deleteMany(deleteCriteria);

    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} unverified accounts.`);
    }
  }
}
