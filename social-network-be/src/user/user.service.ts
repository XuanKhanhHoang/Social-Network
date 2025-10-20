import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas';
import * as bcrypt from 'bcryptjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserPrivacy } from 'src/share/enums';
import { GetProfileResponseDto } from './dto/res/get-profile-by-user-name.dto';
import { RegisterDto } from 'src/auth/dtos/req/register.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const { birthDate, firstName, gender, lastName, email, password } =
      registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await this.generateUniqueUsername(firstName, lastName);

    const user = new this.userModel({
      firstName,
      email,
      password: hashedPassword,
      lastName,
      gender,
      birthDate,
      isVerified: false,
      username,
    });

    return user.save();
  }
  async getProfileByUsername(
    username: string,
    requestingUserId: string | null,
  ): Promise<GetProfileResponseDto> {
    const profileUser = await this.userModel
      .findOne({ username })
      .select(
        'firstName lastName username avatar coverPhoto createdAt bio work currentLocation friendCount privacySettings friends',
      );

    if (!profileUser) {
      throw new NotFoundException('User not found');
    }

    const isOwner =
      requestingUserId && profileUser._id.toString() === requestingUserId;

    const isFriend =
      !isOwner &&
      requestingUserId &&
      profileUser.friends.some(
        (friendId) => friendId.toString() === requestingUserId,
      );

    const profileResponse: Partial<User> = {
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      username: profileUser.username,
      avatar: profileUser.avatar,
      coverPhoto: profileUser.coverPhoto,
      createdAt: profileUser.createdAt,
      bio: profileUser.bio,
    };

    const canView = (fieldPrivacy: UserPrivacy): boolean => {
      if (isOwner) return true;

      switch (fieldPrivacy) {
        case UserPrivacy.PUBLIC:
          return true;
        case UserPrivacy.FRIENDS:
          return isFriend;
        case UserPrivacy.PRIVATE:
          return false;
        default:
          return false;
      }
    };

    const settings = profileUser.privacySettings;

    if (canView(settings.work)) {
      profileResponse.work = profileUser.work;
    }
    if (canView(settings.currentLocation)) {
      profileResponse.currentLocation = profileUser.currentLocation;
    }
    if (canView(settings.friendList)) {
      profileResponse.friendCount = profileUser.friendCount;
    }

    return profileResponse as GetProfileResponseDto;
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findByEmailAndVerified(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email, isVerified: true })
      .select('+password');
  }

  async findByIdBasic(userId: string): Promise<User | null> {
    return this.userModel
      .findById(userId)
      .select('avatar email firstName lastName username');
  }

  async markUserAsVerified(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    user.isVerified = true;
    return user.save();
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
      const existingUser = await this.userModel.findOne({ username });

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

    const { deletedCount } = await this.userModel.deleteMany(deleteCriteria);

    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} unverified accounts.`);
    }
  }
}
