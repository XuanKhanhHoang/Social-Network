import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { User } from 'src/schemas';
import {
  BaseQueryOptions,
  BaseRepository,
} from 'src/share/base-class/base-repository.service';
import {
  CreateUserData,
  UserBasicData,
  UserFriendsContextData,
  UserFriendsData,
  UserProfileData,
} from '../interfaces';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    super(userModel);
  }
  async findUserWithFriend(
    userId: string,
    friendId: string,
  ): Promise<User | null> {
    return this.findOne({
      _id: new Types.ObjectId(userId),
      friends: new Types.ObjectId(friendId),
    });
  }
  async findByEmail(
    email: string,
    options?: BaseQueryOptions<User>,
  ): Promise<User | null> {
    return this.findOne({ email }, options);
  }
  async findByUsername(
    username: string,
    options?: BaseQueryOptions<User>,
  ): Promise<User | null> {
    return this.findOne({ username }, options);
  }
  async findByEmailAndVerified(email: string): Promise<User | null> {
    return this.findOne(
      { email, isVerified: true },
      { projection: '+password' },
    );
  }
  async findByIdBasic(userId: string): Promise<UserBasicData | null> {
    return this.findLeanedById<UserBasicData>(userId, {
      projection: 'avatar email firstName lastName username',
    });
  }

  async findProfileByUsername(
    username: string,
  ): Promise<UserProfileData | null> {
    return this.findOneLean<UserProfileData>(
      { username },
      {
        projection:
          'firstName lastName username avatar coverPhoto ' +
          'privacySettings friendCount bio work currentLocation friends createdAt',
      },
    );
  }

  async findByIdWithPopulatedFriends(
    userId: Types.ObjectId | string,
    limit: number,
  ): Promise<UserFriendsData | null> {
    return this.model
      .findById(userId)
      .populate({
        path: 'friends',
        select: 'firstName lastName username avatar',
        options: { limit },
      })
      .select('friends')
      .lean()
      .exec() as unknown as Promise<UserFriendsData | null>;
  }

  async findUserFriendsContextByUsername(
    username: string,
  ): Promise<UserFriendsContextData | null> {
    return this.findOneLean<UserFriendsContextData>(
      { username },
      {
        projection: 'friendCount privacySettings.friendList',
      },
    );
  }
  async createUser(userDto: CreateUserData): Promise<User> {
    const user = new this.userModel(userDto);
    return user.save();
  }

  async deleteMany(
    filter: FilterQuery<User>,
  ): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }
}
